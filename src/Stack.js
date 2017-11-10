

var MAX_STACK_SIZE = 1024;
var MAX_FLOAT_SIZE = 2000000000;

var Stack = function(){
	this.s = [ ];
};

Stack.prototype.push = function(n){
	if(this.s.length < MAX_STACK_SIZE){
		this.s.push(n);
	}
	else if(n > MAX_FLOAT_SIZE){
		throw new Error("Overflow");
	}
	else{
		throw new Error("Stack size exceeded");
	}
};

Stack.prototype.pop = function(){
	if(this.s.length === 0){
		throw new Error("Stack size empty");
	}
	else{
		var r = this.s.pop();
		return r;
	}
};

Stack.prototype.clear = function(){
	this.s = [ ];
};

Stack.prototype.describe = function(){
	return this.s.toString();
};

module.exports = Stack;
