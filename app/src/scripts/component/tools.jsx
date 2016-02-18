import React from 'react';
import { connect } from 'react-redux';

/*
* 环境切换
*/
var EnvSelector = React.createClass({
	changeEnv: function(event) {
		var name = event.target.value;
		this.props.doSwitchEnv(name);
	},
	render: function() {
		let options = this.props.envNames;
		let selected = this.props.currentEnv.name;
		let optionItems = [];
		options.forEach(function(op, index) {
			optionItems.push(
				<option key={index} value={op}>{op}</option>
			);
		});
		return (
			<div className="selector">
				<select className="env-groups" value={selected} onChange={this.changeEnv}>
					{optionItems}
				</select>
			</div>
		);

	}
});
/*
* 新增环境
*/
var AddEnv = React.createClass({
	add: function() {
		var name = window.prompt('新环境名称?');
		name && this.props.doAddEnv(name);
	},
	render: function() {
		return (
			<a className="add-env" href="#" onClick={this.add} >新增环境</a>
		)
	}
});
/*
* 删除环境
*/
var DelteEnv = React.createClass({
	del: function(e) {
		var name = this.props.currentEnv.name;
		var envNames = this.props.envNames;
		(envNames.length > 1) && this.props.doDelEnv(name);
	},
	render: function() {
		return (
			<a className="remove-env" href="#" onClick={this.del}>删除环境</a>
		)	
	}
});

var Tools = React.createClass({
	render: function() {
		// console.log('render tools');
		return (
			<section className="m-title">
				<div className="tools">
					<div className="current">
					<span className="info">当前环境:</span>
					<EnvSelector envNames={this.props.envNames} 
								 currentEnv={this.props.currentEnv} 
								 doSwitchEnv={this.props.doSwitchEnv}/>
					<AddEnv doAddEnv={this.props.doAddEnv}/>
					<DelteEnv  currentEnv={this.props.currentEnv} doDelEnv={this.props.doDelEnv} envNames={this.props.envNames}/>
					</div>
				</div>
			</section>
			
		);
	}
});

export default Tools;
// export default connect(mapStateToProps)(Tools);
