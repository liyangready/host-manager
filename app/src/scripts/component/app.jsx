import React from 'react';
import { connect } from 'react-redux';
import { doAddEnv, doSwitchEnv, doDelEnv, doSaveEnv, 
		 doEditEnv, doSwitchEditLine, doChangeEditInput, 
		 doSaveEditInput, doSwitchLineState, doSwitchAllGroup,
		 doCloseGroup, doGoEditMode, doChangeContent,
		 doSaveContent, doCancleContent, doSwitchAllInEnv,
		 doSearchHost, doCloseAllInEnv } from '../action/action.js';
import Tools from './tools.jsx';
import Editor from './editor.jsx';
import { saveStore } from '../localstore.js';

var App = React.createClass({
	render: function() {
		var dispatch = this.props.dispatch;
		return (
			<div>
				<Tools envNames={this.props.envNames} 
					   currentEnv={this.props.currentEnv}
					   doSwitchEnv={name=> dispatch(doSwitchEnv(name))}
					   doAddEnv={name=> dispatch(doAddEnv(name))}
					   doDelEnv={name=> dispatch(doDelEnv(name))} />
				<Editor currentEnv={this.props.currentEnv}
						doSaveEnv={content=> dispatch(doSaveEnv(content))}
						doSwitchEditLine={itemKey=> dispatch(doSwitchEditLine(itemKey))}
						doChangeEditInput={(itemKey, value)=> dispatch(doChangeEditInput(itemKey, value))}
						doSaveEditInput={() => dispatch(doSaveEditInput())}
						doSwitchLineState={itemKey=> dispatch(doSwitchLineState(itemKey))}
						doSwitchAllGroup={groupIndex=> dispatch(doSwitchAllGroup(groupIndex))}
						doCloseGroup={groupIndex=> dispatch(doCloseGroup(groupIndex))} 
						doGoEditMode={()=> dispatch(doGoEditMode())}
						doChangeContent={(content)=> dispatch(doChangeContent(content))}
						doSaveContent={(content)=> dispatch(doSaveContent(content))}
						doCancleContent={()=> dispatch(doCancleContent())}
						doSwitchAllInEnv={()=> dispatch(doSwitchAllInEnv())}
						doSearchHost={(value)=> dispatch(doSearchHost(value))}
						doCloseAllInEnv={()=> dispatch(doCloseAllInEnv())}/>
			</div>

		);
	}
});

function mapStateToProps(state) {
	var rtState = saveStore(state);
	rtState && (state = rtState); //存储出错
	var envs = state.get('envs');
	var envNames = envs.map(value => value.get('name'));
	var currentEnvName = state.get('currentEnvName');
	var currentEnv;
	envs.forEach(value => {
		if (value.get('name') === currentEnvName) {
			currentEnv = value;
		}
	}); 
	envNames = envNames.toJS();
	currentEnv = currentEnv && currentEnv.toJS();
	return {
		envNames: envNames,
  		currentEnv: currentEnv
  	}
}


export default connect(mapStateToProps)(App);
