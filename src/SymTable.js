const _ = 						require("underscore");

var _getTargetName = function(name){
	if(_getType(name) === "setup"){
		return name.split("-")[1];
	}
	else if(_getType(name) === "daemon"){
		return name.split("-")[1];
	}
};

var _getType = function(name){
	if(name.indexOf("setup-") >= 0){
		return "setup";
	}
	else if(name.indexOf("daemon-") >= 0){
		return "daemon";
	}
};

var SymTable = function(){
	this.blocks = [ ];
	this.functions = {};
	this.setups = {}; // maps targetname to hash {fnname:obj}
	this.daemons = {}; // maps targetname to hash {fnname:obj}
	this.target = null;
};

SymTable.prototype.getCurrentBlock = function(){
	return this.blocks[this.blocks.length - 1];
}

SymTable.prototype.enterBlock = function(){
	var block = { };
	this.blocks.push(block);
};

SymTable.prototype.exitBlock = function(){
	this.blocks.pop();
};

SymTable.prototype.get = function(name){
	var block, i;
	for(i = this.blocks.length - 1; i >= 0; i--){
		block = this.blocks[i];
		if(block[name] !== null && block[name] !== undefined){
			return block[name];
			break;
		}
	}
	return null;
};

SymTable.prototype.getTarget = function(){
	return this.target;
};

SymTable.prototype.setTarget = function(t){
	this.target = t;
};

SymTable.prototype.add = function(name, val){
	this.getCurrentBlock()[name] = val;
};

SymTable.prototype.activateDaemon = function(name){
	var targetName, obj;
	targetName = _getTargetName(name);
	obj = this.daemons[targetName][name];
	if(obj){
		obj.enabled = true;
	}
};

SymTable.prototype._addFunction = function(name, obj){
	var targetName;
	this.functions[name] = obj;
	if(_getType(name) === "setup"){
		targetName = _getTargetName(name);
		this.setups[targetName] = this.setups[targetName] || {};
		this.setups[targetName][name] = obj;
		console.log("add setup", targetName, name);
	}
	else if(_getType(name) === "daemon"){
		targetName = _getTargetName(name);
		this.daemons[targetName] = this.daemons[targetName] || {};
		this.daemons[targetName][name] = obj;
		console.log("add daemon", targetName, name);
	}
};

SymTable.prototype.addFunction = function(name, argsNode, statementsNode){
	this._addFunction(name, {
		"name":name,
		"argsNode":argsNode,
		"statementsNode":statementsNode
	});
};

SymTable.prototype.getSetupForTargetType = function(type){
	return _.values(this.setups[type]) || [];
};

SymTable.prototype.getDaemonsForTargetType = function(type){
	return _.values(this.daemons[type]) || [];
};

SymTable.prototype.getActiveDaemonsForTargetType = function(type){
	return _.where(this.getDaemonsForTargetType(type), {"enabled":true});
};

SymTable.prototype.getFunctionByName = function(name){
	return this.functions[name];
};

SymTable.prototype.clear = function(){
	var i;
	this.functions = null;
	for(i = 0; i < this.blocks.length; i++){
		this.blocks[i] = null;
	}
	this.blocks = [];
};

module.exports = SymTable;
