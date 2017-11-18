
var Patch = function(data){
	this.data = data || {};
	this.data.vars = {};
};

Patch.prototype.setVar = function(name, val){
	this.data.vars[name] = val;
};

Patch.prototype.getVar = function(name){
	var v = this.data.vars[name];
	if(typeof v === "undefined"){
		v = 0;
	}
	return v;
};

module.exports = Patch;
