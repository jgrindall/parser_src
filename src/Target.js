
var Target = function(data){
	this.data = data;
};

Target.prototype.getType = function () {
	return this.data.type;
};

Target.prototype.consume = function (msg) {
	if(msg.type === "command"){
		if(msg.name === "fd"){
			this.data.pos.x += msg.amount;
		}
		else if(msg.name === "rt"){
			this.data.angle += msg.amount;
		}
		else if(msg.name === "setxy"){
			this.data.pos.x = msg.amountX;
			this.data.pos.y = msg.amountY;
		}
	}
};

module.exports = Target;
