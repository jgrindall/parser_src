const Parser = 					require("./Parser");
const Visit = 					require("./Visit");

var _clean = function(logo){
	return logo
		.replace(/;[^\n\r]+\n/g, "")
		.replace(/#[^\n\r]+\n/g, "")
		.replace(/\/\/[^\n\r]+\n/g, "");
};

var _getTree = function(logo){
	return Parser.parse(_clean(logo));
};

module.exports = {
	"getTree":function(logo){
		return _getTree(logo);
	},
	"draw":function(logo, consumer, targets){
		var tree = _getTree(logo);
		if(tree && consumer && targets){
			return Visit.start(tree, consumer, targets);
		}
		else{
			throw "wrong input";
		}
	},
	"stop":function(){
		Visit.stop();
	},
	"version":"%%VERSION%%"
};
