import { ADD_ENV, SWITCH_ENV, DEL_ENV, SAVE_ENV, EDIT_ENV,
		 EDIT_STATS, SWITCH_EDIT_LINE, CHANGE_EDIT_INPUT, 
		 SAVE_EDIT_INPUT, SWITCH_LINE_STATE, SWITCH_ALL_GROUP,
		 CLOSE_GROUP, GO_EDIT_MODE, CHANGE_CONTENT, SAVE_CONTENT, 
		 CANCLE_CONTENT, SWITHCH_ALL_IN_ENV, SEARCH_HOST, CLOSE_ALL_IN_ENV } from '../action/action.js';
import immutable from 'immutable';
import hostParser from '../util/hostParser.js';
import { getInitStates, getNewEnvState } from '../localstore.js';

/*
	state = {
		"envs": [{
			"name": "envA",
			"content": "",
			"postContent": ""
			"editState": "saved"
		}],
		"currentEnvName": "envA"
	}
*/


function hostManager(state, action) {
	switch(action.type) {
		case EDIT_ENV: 
			return setEditSate(state, action.content);
		case SAVE_ENV:
			return saveEnv(state, action.content);
		case ADD_ENV:
			return addEnv(state, action.name);
		case SWITCH_ENV:
			return swithEnv(state, action.name);
		case DEL_ENV:
			return delEnv(state, action.name);
		case SWITCH_EDIT_LINE:
			return switchEditLine(state, action.itemKey);
		case CHANGE_EDIT_INPUT:
			return changeEditInput(state, action.itemKey, action.value);
		case SAVE_EDIT_INPUT: 
			return saveEditInput(state);
		case SWITCH_LINE_STATE:
			return switchLineState(state, action.itemKey);
		case SWITCH_ALL_GROUP:
			return switchAllGroup(state, action.groupIndex);
		case CLOSE_GROUP: 
			return closeGroup(state, action.groupIndex);
		case GO_EDIT_MODE:
			return goEditMode(state);
		case CHANGE_CONTENT:
			return changeContent(state, action.content);
		case SAVE_CONTENT:
			return saveContent(state);
		case CANCLE_CONTENT:
			return cancleContent(state);
		case SWITHCH_ALL_IN_ENV:
			return switchAllInEnv(state);
		case SEARCH_HOST: 
			return searchHost(state, action.value);
		case CLOSE_ALL_IN_ENV:
			return closeAllInEnv(state);
		// case CHANGE_GROUP_NAME:
		// 	return changeGroupName(state, action.groupIndex);
		default: 
			return getInitStates();
	}
	
}

function setEditSate(state, content) {
	return _mergeCurrentEnv(state, {
		content: content,
		editState: EDIT_STATS.UN_SAVE
	});
}

function saveEnv(state, content) {
	return _mergeCurrentEnv(state, {
		postContent: content,
		editState: EDIT_STATS.SAVED
	});
}

function addEnv(state, name) {
	state.get('envs').forEach(function (value, index) {
		if (value.get('name') === name) {
			name = name + index;
		}
	});
	var ns = state.update('envs', list => list.push(
		getNewEnvState(name)
	));
	return ns.set('currentEnvName', name);
}

function swithEnv(state, name) {
	return state.set('currentEnvName', name);
}

function delEnv(state, name) {
	var nstate = state.update('envs', list => {
		var index = list.findIndex(value => value.get('name') === name);
		return list.remove(index);
	});
	return nstate.set('currentEnvName', 'default');
}

function switchEditLine(state, itemKey) {
	// 改变当前编辑的行
	var nstate = _mergeCurrentEnv(state, {
		editingLine: itemKey
	});
	// 同步inputValue
	return _updateLine(nstate, itemKey, function(line) {
		var inputValue = hostParser.getInputValue(line.toJS());
		return line.set('inputValue', inputValue);
	});	 
}

function changeEditInput(state, itemKey, value) {
	return _updateLine(state, itemKey, function(line) {
		return line.set('inputValue', value);
	});
}

function saveEditInput(state) {
	return _updateCurrentEnv(state, current => {
		return current.withMutations(current => {
			var currentItemKey = current.get('editingLine');
			var oldList = current.get('renderList').toJS();
			var inputValue = _getInputValue(current, currentItemKey);
			var newList = hostParser.updateLine(oldList, currentItemKey, inputValue);
			newList = immutable.fromJS(newList);
			current.set('editingLine', '');
			current.set('renderList', newList);
		});
	});
}

function switchLineState(state, itemKey) {
	// 改变自己状态
	var needChangeOther = false;
	var changeLine;
	var nstate = _updateLine(state, itemKey, line => {
		var used = line.get('used');
		!used && (needChangeOther = true);
		changeLine = line.set('used', !used);
		return changeLine;
	});
	// 取消选中其他
	if (needChangeOther) {
		nstate = _updateCurrentEnv(nstate, current => {
			return current.update('renderList', renderList => {
				var newList, oldList = renderList.toJS();
				newList = hostParser.forceUse(oldList, [changeLine.toJS()]);
				return immutable.fromJS(newList);
			});
		});
	}
	return nstate;
	
}

function switchAllGroup(state, groupIndex) {
	var tempMap = {};
    return _updateCurrentEnv(state, current => {
        return current.update('renderList', renderList => {
        	var newList = renderList.toJS();
        	var group = newList[groupIndex];
        	var doLines = hostParser.switchAllGroup(group);
        	if (doLines.length) {
        		//开启该组当前的，需要关闭其他组同类
        		newList = hostParser.forceUse(newList, doLines);
        	} 
        	group.used = !group.used;
       		return immutable.fromJS(newList);
        });
    });
}

function closeGroup(state, groupIndex) {
	return _updateCurrentEnv(state, current => {
        return current.update('renderList', renderList => {
        	var group = renderList.get(groupIndex);
        	return renderList.set(groupIndex, group.set('close', !(group.get('close'))));
        });
    });
}

function goEditMode(state) {
	return _updateCurrentEnv(state, current => {
		var renderList = current.get('renderList');
		var content = hostParser.toString(renderList.toJS(), current.get('name'));
		return current.withMutations(current=> {
			current.set('content', content);
			current.set('editState', EDIT_STATS.UN_SAVE);
		})
	});
}

function changeContent(state, content) {
	return _updateCurrentEnv(state, current => {
		return current.set('content', content);
	});
}

function saveContent(state) {
	var envName;
	var nstate = _updateCurrentEnv(state, current => {
		var name = current.get('name');
		var content = current.get('content');
		var result = hostParser.parse(content, name);
		envName = result.envName;
		return current.withMutations(current=> {
			current.set('name', envName);
			current.set('renderList', immutable.fromJS(result.renderList));
			current.set('editState', EDIT_STATS.SAVED);
		})
	});
	return nstate.set('currentEnvName', envName);
}

function cancleContent(state) {
	return _updateCurrentEnv(state, current => {
		return current.set('editState', EDIT_STATS.SAVED);
	});
}

function switchAllInEnv(state) {
	var tempMap = {};
	return _updateCurrentEnv(state, current=> {
		var allUse = current.get('allUse');
		var nCurrent = current.set('allUse', !allUse);
		nCurrent = _updateAllGroup(nCurrent, group=> {
			return group.set('used', !allUse)
		});
		nCurrent = _updateAllLine(nCurrent, line=> {
			var host = line.get('host');
			var ip = line.get('ip');
			if (!allUse) {
				//选中
				!tempMap[host] && (tempMap[host] = ip) && (line = line.set('used', !allUse));
				return line;
			}
			return line.set('used', !allUse);
		});
		return nCurrent;
	})
}

function searchHost(state, value) {
	return _updateCurrentEnv(state, current=> {
		return current.set('searchHost', value);
	})
}

function closeAllInEnv(state) {
	return _updateCurrentEnv(state, current=> {
		var allClose = current.get('allClose');
		var nCurrent = current.set('allClose', !allClose);
		return _updateAllGroup(nCurrent, group=> {
			return group.set('close', !allClose)
		});
	});
}
function _getInputValue(current, currentItemKey) {
	var line = _getLineByKey(current, currentItemKey);
	return line.get('inputValue');
}

function _getLineByKey(current, currentItemKey) {
	if (!/^\d+-\d+$/.test(currentItemKey)) {
		return '';
	}
	var [groupIndex, lineIndex] = currentItemKey.split('-');
	var renderList = current.get('renderList');
	var group = renderList.get(groupIndex);
	var line = group.get('items').get(lineIndex);
	return line;
}

function _updateCurrentEnv(state, cb) {
	var currentEnvName = state.get('currentEnvName');
	return state.update('envs', list => {
		return list.map(value => {
			let nvalue = value;
			if (value.get('name') === currentEnvName) {
				nvalue = cb(value);
			}
			return nvalue;
		});
	});
}

function _mergeCurrentEnv(state, obj) {
	return _updateCurrentEnv(state, current=> {
		return current.merge(obj);
	})
}

function _updateAllGroup(current, cb) {
	return current.update('renderList', list=> {
		return list.map(group=> {
			return cb(group);
		});
	});
}

function _updateAllLine(current, cb) {
	return _updateAllGroup(current, function(group) {
		return group.update('items', items=> {
			return items.map(line=> {
				return cb(line);
			});
		});
	});
}

function _updateLine(state, itemKey, cb) {
	if (!/^\d+-\d+$/.test(itemKey)) {
		return state;
	}
	var [groupIndex, lineIndex] = itemKey.split('-');
	return _updateCurrentEnv(state, current => {
		return current.update('renderList', list => {
			var group = list.get(groupIndex);
			var lines = group.get('items');
			var line = lines.get(lineIndex);
			line = cb(line);
			lines = lines.set(lineIndex, line);
			group = group.set('items', lines);
			return list.set(groupIndex, group);
		});
	});
}


export default hostManager;