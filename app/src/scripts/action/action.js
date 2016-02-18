export const ADD_ENV = "ADD_ENV";
export const SWITCH_ENV = "SWITCH_ENV";
export const DEL_ENV = "DEL_ENV";
export const SAVE_ENV = "SAVE_ENV";
export const EDIT_ENV = "EDIT_ENV";
export const SWITCH_EDIT_LINE = "SWITCH_EDIT_LINE";
export const CHANGE_EDIT_INPUT = "CHANGE_EDIT_INPUT";
export const SAVE_EDIT_INPUT = "SAVE_EDIT_INPUT";
export const SWITCH_LINE_STATE = "SWITCH_LINE_STATE";
export const SWITCH_ALL_GROUP = "SWITCH_ALL_GROUP";
export const CLOSE_GROUP = "CLOSE_GROUP";
export const GO_EDIT_MODE = "GO_EDIT_MODE";
export const CHANGE_CONTENT = "CHANGE_CONTENT";
export const SAVE_CONTENT = "SAVE_CONTENT";
export const CANCLE_CONTENT = "CANCLE_CONTENT";
export const SWITHCH_ALL_IN_ENV = "SWITHCH_ALL_IN_ENV";
export const SEARCH_HOST = "SEARCH_HOST";
export const CLOSE_ALL_IN_ENV = "CLOSE_ALL_IN_ENV";
// export const CHANGE_GROUP_NAME = "CHANGE_GROUP_NAME";
export const EDIT_STATS = {
	UN_SAVE: "UN_SAVE",
	SAVED: "SAVED"
}

//新增一套环境
export function doAddEnv(name, content) {
    return {
        name: name,
        type: ADD_ENV,
        content: content || ''
    }
}

//切换一套环境
export function doSwitchEnv(name) {
	return {
		name: name,
		type: SWITCH_ENV
	}
}
//删除一套环境
export function doDelEnv(name) {
	return {
		name: name,
		type: DEL_ENV
	}
}
//保存当前环境
export function doSaveEnv(content) {
	return {
		content: content,
		editStat: EDIT_STATS.SAVED,
		type: SAVE_ENV
	}
}
//修改当前环境
export function doEditEnv(content) {
	return {
		content: content,
		editStat: EDIT_STATS.UN_SAVE,
		type: EDIT_ENV
	}
}

//修改某个host
export function doSwitchEditLine(itemKey) {
	return {
		type: SWITCH_EDIT_LINE,
		itemKey: itemKey
	}
}

//修改某个host的input值
export function doChangeEditInput(itemKey, value) {
	return {
		type: CHANGE_EDIT_INPUT,
		itemKey: itemKey,
		value: value
	}
}

//保存某个input的修改
export function doSaveEditInput() {
	return {
		type: SAVE_EDIT_INPUT
	}
}

//选中或者注释某个host
export function doSwitchLineState(itemKey) {
	return {
		type: SWITCH_LINE_STATE,
		itemKey: itemKey
	}
}

//选中/取消全组
export function doSwitchAllGroup(groupIndex) {
	return {
		type: SWITCH_ALL_GROUP,
		groupIndex: groupIndex
	}
}

//展开/收起组
export function doCloseGroup(groupIndex) {
	return {
		type: CLOSE_GROUP,
		groupIndex: groupIndex
	}
}

//进入编辑模式
export function doGoEditMode() {
	return {
		type: GO_EDIT_MODE
	}
}

//修改content
export function doChangeContent(content) {
	return {
		type: CHANGE_CONTENT,
		content: content
	}
}

export function doSaveContent(content) {
	return {
		type: SAVE_CONTENT
	}
}

export function doCancleContent() {
	return {
		type: CANCLE_CONTENT
	}
}

export function doSwitchAllInEnv() {
	return {
		type: SWITHCH_ALL_IN_ENV
	}
}

export function doSearchHost(value) {
	return {
		type: SEARCH_HOST,
		value: value
	}
}
export function doCloseAllInEnv() {
	return {
		type: CLOSE_ALL_IN_ENV
	}
}
//修改组名
// export function doChangeGroupName(groupIndex) {
// 	return {
// 		type: CHANGE_GROUP_NAME,
// 		groupIndex: groupIndex
// 	}
// }