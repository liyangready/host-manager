var SPLIT_NAME = '@';
var hostParser = {
	parse: function(content, currentEnv) {
		var contentArr = (content && content.split(/\r?\n/)) || [];
		var currentGroup;
		var results  = [];
		var hostMap = {};
		var envName;
		contentArr.forEach((item, index) => {
			item = item.trim();
			if (!item) {return;}
			if (!envName) {
			    //解析第一行是否是正确的格式，如果是，取环境名
			    if (item.indexOf(SPLIT_NAME) === 0) {
			        envName = item.split(SPLIT_NAME)[1];
			        return;
			    } else {
			        //不是 取默认
			        envName = currentEnv || 'default';
			    }
			}

			var parseResult = this.parseOneLine(item);
			if (parseResult.type === 'host') {
				var hostList = parseResult.result;
				if (!currentGroup) {
					currentGroup = {
						name: '默认组',
						items: [],
						index: results.length
					}
					results.push(currentGroup);
				}
				// 加入hostMap，判断之前是否存在，修改used的值
				hostList.forEach(perHost => {
					if (perHost.used) {
						hostMap[perHost.host] && (perHost.used = false);
						!hostMap[perHost.host] && (hostMap[perHost.host] = perHost.ip);
					}

					this.initLine(perHost, currentGroup);
					perHost.index = currentGroup.items.length;
					currentGroup.items.push(perHost);
				})
			} else if (parseResult.type === 'group') {
				currentGroup = parseResult.result[0];
				currentGroup.index = results.length;
				currentGroup.close = false; //是否关闭显示改组
				currentGroup.used = false; //是否整组启用
				results.push(currentGroup);
			}
		});
		
		return {
			renderList: results,
			hostMap: hostMap,
			envName: envName
		};
	},
	getInputValue: function(item) {
		return (item.used? '': '#') + item.ip + ' ' + item.host + (item.comment? (' ' + item.comment): '');
	},
	parseOneLine: function(item) {
	    var hostReg = /^(#)?(\d{1,3}(?:\.\d{1,3}){3}\s+)?([^#]*)(#.*)?/g;
	    var exResult = hostReg.exec(item);
	    var parseResult = {
	    	type: 'host',
	    	result: []
	    };
	    if (!exResult) {
	        console.log('host parse fail', item);
	        return;
	    }
	    var [matchStr, sharp, ip, host, comment] = exResult;
	    if (ip && host) {
	        //合法的记录
	        parseResult.type = 'host';
	        ip = ip.trim();
	        host = host.trim().split(/\s+/);
	        // 去重
	        var temp = {};
	        var keys = [];
	        host.forEach(function(hostStr) {
	        	temp[hostStr] = 1;
	        });
	        keys = Object.keys(temp);
	        // 拆开连续的host 例如: 127.0.0.1 localhost localhost1 localhost2 
	        keys.forEach(function(hostStr) {
	            parseResult.result.push({
	                ip: ip.trim(),
	                host: hostStr.trim(),
	                comment: comment,
	                used: sharp? false: true
	            });
	        });
	        return parseResult;
	    }
	    if (sharp) {
	        //组
	        parseResult.type = 'group';
	        parseResult.result.push({
	            name: matchStr.substr(1).trim() || '默认组',
	            items: []
	        });
	    }
	    return parseResult;
	},
	updateLine: function(list, key, value) {
		var [groupIndex, lineIndex] = key.split('-');
		var _backData = list;
		var oldGroup = _backData[groupIndex];
		var oldLine = oldGroup.items[lineIndex];
		var newResult = this.parseOneLine(value);
		var isUpdate = true;
		if (!newResult || newResult.type === 'group') {
			//删除
			// hostMap[oldLine.host] && (delete hostMap[oldLine.host]); //更新hostMap
			oldGroup.splice(lineIndex, 1);
			this.resortLine(oldGroup); //重排group
			return _backData;
		}
		
		var newLine = newResult.result[0];
		if (newResult.result.length === 1 
			&& newLine.used === oldLine.used
			&& newLine.ip === oldLine.ip 
			&& newLine.host === oldLine.host 
			&& newLine.comment === oldLine.comment) {
			//未发生变化
			return _backData;
		}

		this.forceUse(_backData, newResult.result); //强制使用用户手动处理的状态
		oldGroup.items.splice(lineIndex, 1, ...newResult.result);//可能变成多个
		this.resortLine(oldGroup); //重排group
		return _backData;

	},
	resortLine: function(group) {
		group.items.forEach((line, index) => {
			this.initLine(line, group);
			line.index = index; 
			
		});
	},
	initLine: function(line, group) {
		line.groupIndex = group.index;
		line.groupName = group.name;
		line.inputValue = this.getInputValue(line);
	},
	forceUse: function(list, lines) {
		lines.forEach(line => {
			if (line.used === true) {
				this.travelAllLine(list, (tline, tgroup)=> {
					if (line.groupIndex === tgroup.index && line.index === tline.index) {
						return;
					}
					if (tline!==line && tline.host === line.host) {
						tline.used = false;
					}
				});
			}
		});
		return list;
	},
	travelAllLine: function(list, cb) {
		list.forEach(group => {
			group.items.forEach(line => {
				cb(line, group);
			});
		});
	},
	toString: function(list, name) {
		var content = [];
		content.push(`						${SPLIT_NAME}${name}\n`);
		list.forEach(group => {
			content.push('#', group.name);
			group.items.forEach(line => {
				content.push('\n');
				if (line.used === false) {
					content.push('#');
				}
				content.push(line.ip, ' ', line.host);
				line.comment && content.push(' ', line.comment);
			});
			content.push('\n');
			group.items.length && content.push('\n'); //控制格式
		});
		return content.join('');

	},
	getHostMap: function(list) {
		var hostMap = {};
		this.travelAllLine(list, (line, group)=> {
			!(hostMap[line.host]) && (hostMap[line.host] = line.ip);
		});
		return hostMap;
	},
	switchAllGroup: function(group) {
		var tempMap = {};
		var doLines = [];
		var currentState = group.used;
		group.items.forEach(function(line) {
			if (currentState) {
				//关闭
				line.used = !currentState;
			} else {
				!tempMap[line.host] 
				&& (line.used = !currentState) 
				&& doLines.push(line)
				&& (tempMap[line.host] = line.ip);
			}
		});
		return doLines;
	}
	
}

export default hostParser;