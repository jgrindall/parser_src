var SymTable = function(){
	this.blocks = [ ];
	this.functions = {};
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
	for(i = this.blocks.length - 1; i>=0; i--){
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

SymTable.prototype.setTarget = function(i){
	alert("set" + i)
	this.target = i;
};

SymTable.prototype.add = function(name, val){
	this.getCurrentBlock()[name] = val;
};

SymTable.prototype.addFunction = function(name, argsNode, statementsNode){
	this.functions[name] = {"argsNode":argsNode, "statementsNode":statementsNode};
};

SymTable.prototype.getFunction = function(name){
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

