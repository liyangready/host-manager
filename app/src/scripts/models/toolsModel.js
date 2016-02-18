
class ToolsModel{
	constructor(options, selected) {
		this.options = options || ['blank'];
		this.selected = selected || this.options[0];
	}
	pushOption(option) {
		this.options.push(option);
	}
	unShiftOption(option) {
		this.options.unshift(option);
	}
	getOptions() {
		return this.options;
	}
	reset() {
		this.options = ['blank'];
		this.selected = '';
	}
}

export {ToolsModel}