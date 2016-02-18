/* 持久化存储方案 */
import immutable from 'immutable';
import hostParser from './util/hostParser.js';
import { EDIT_STATS } from './action/action.js';
var hostPath, isNodeWebKit = false, 
	gui = global.require && global.require('nw.gui'), 
	path = global.require && global.require('path'),
	fs = global.require && global.require('fs');
//存在window上给node-webkit使用
if (gui) {
	hostPath = path.join( gui.App.dataPath , './hosts');
	isNodeWebKit = true;
}
export function saveStore(state) {
	try {
		var stateJs = state.toJSON();
		if (isNodeWebKit) {
			// node-webkit
	    	fs.writeFileSync(hostPath, JSON.stringify(stateJs));
		} else {
			localStorage.setItem('hostManager', JSON.stringify(stateJs));
		}
	} catch(e) {
		top.logger && top.logger.doLog('error', e.message); 
		return getInitStates();
	}
	top && (top.__hostState = stateJs); //for findhost
	
}

export function getStore() {
	if (isNodeWebKit) {
		// node-webkit
		try {
			var state = fs.readFileSync(hostPath, 'utf-8');
		} catch(e) {
			top.logger && top.logger.doLog('error', e.message); 
			state = {};
		}
	} else {
		var state = localStorage.getItem('hostManager');
	}
	try {
		state = JSON.parse(state); 
	} catch(e) {
		// 老版本的存的字符串
	}
	return state;
}

export function getNewEnvState(name) {
	return immutable.fromJS(
		$.extend({}, getDefault() ,{
			name: name
		})
	)
}
export function getInitStates() {
	var result, state;
	var initState = getStore();
	if (typeof initState === 'string') { //host字符串
		result = hostParser.parse(initState);
		state = {
			envs: [
				$.extend({}, getDefault(), {
					content: initState,
					renderList: result.renderList //ui状态渲染host列表所需数据
				})
			],
			currentEnvName: "default"
		}
	} else { //host状态
		initState =  _checkState(initState);
		state = initState;
	}
	return immutable.fromJS(state);
}

function getDefault() {
	var defaultContent = "";
	return {
		allUse: true,
		allClose: false,
		name: 'default',
		searchHost: '',
		editingLine: '', //正在编辑的host
		content: defaultContent,
		editState: EDIT_STATS.SAVED, //是编辑状态还是ui展示状态
		renderList: [] //ui状态渲染host列表所需数据
	}
}

function _checkState(initState) {
	var defaultStates = {
			envs: [getDefault()],
			currentEnvName: "default"
		};
	if (!initState || !(initState.envs && initState.envs.length) || !initState.currentEnvName) {
		return defaultStates
	} else {
		return $.extend({}, defaultStates, initState)
	}
}
