const Stack = 					require("./Stack");
const SymTable = 				require("./SymTable");
const Target = 					require("./Target");
const _ = 						require("underscore");
const Promise = 				require("bluebird");

var stack, symTable, _active = false, _consumer, _target;

Promise.resolveLater = function(){
	if(!_active){
		return Promise.reject();
	}
	return Promise.resolve();
};

function _parseTargets(targets){
	return _.map(targets, function(t){
		return new Target(t);
	});
};

function _delay(t) {
	var res = function(resolve, reject) {
    	resolveLater(resolve, reject, t);
	};
	return new Promise(res);
}

function _test(){
	if(!_active){
		throw "error";
	}
}

function resolveLater(resolve, reject, t){
	if(typeof t === 'undefined'){
		t = 0;
	}
	setTimeout(function(){
		if(!_active){
			reject("stop");
		}
		else{
			resolve();
		}
	}, t);
}

function postError(msg){
	throw new Error(msg);
	postMessage({"type":"error", "msg":msg});
}

function postMessage(s){
	var target = symTable.getTarget();
	target.consume(s);
	_consumer.consume(s);
}

function visitchildren(node){
	_test();
	var makePromise = function(i){
		return new Promise(function(resolve, reject){
			resolve(visitNode(node.children[i]));
		});
	};
	return Promise.each(_.range(node.children.length), makePromise);
}

function visitstart(node){
	symTable.enterBlock();
	return visitchildren(node);
}

function visitinsidestmt(node){
	return visitchildren(node);
}

function visitmakestmt(node){
	var ch, name;
	ch = node.children;
	name = ch[0].name;
	return visitNode( ch[1] ).then(function(){
		_test();
		symTable.add(name, stack.pop());
	});
}

function visitfdstmt(node){
	return visitchildren(node)
	.then(function(){
		_test();
		postMessage({ "type":"command", "name":"fd", "amount":stack.pop()});
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitarcstmt(node){
	return visitchildren(node)
	.then(function(){
		_test();
		var amount1 = stack.pop(), amount2 = stack.pop();
		postMessage({ "type":"command", "name":"arc", "angle":amount2, "radius":amount1 });
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitarcrtstmt(node){
	return visitchildren(node)
	.then(function(){
		_test();
		var amount1 = stack.pop(), amount2 = stack.pop();
		postMessage({ "type":"command", "name":"arcrt", "angle":amount2, "radius":amount1 });
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitarcltstmt(node){
	return visitchildren(node)
	.then(function(){
		_test();
		var amount1 = stack.pop(), amount2 = stack.pop();
		postMessage({ "type":"command", "name":"arclt", "angle":amount2, "radius":amount1 });
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitbkstmt(node){
	return visitchildren(node)
	.then(function(){
		_test();
		var amount = stack.pop();
		postMessage({ "type":"command", "name":"fd", "amount": -1 * amount });
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitpenupstmt(node){
	postMessage({ "type":"command", "name":"penup" });
	return Promise.resolveLater();
}

function visithomestmt(node){
	postMessage({ "type":"command", "name":"home" });
	return Promise.resolveLater();
}

function visitpendownstmt(node){
	postMessage({ "type":"command", "name":"pendown" });
	return Promise.resolveLater();
}

function visitbgstmt(node){
	var colorIndex;
	if(node.color.type === 'colorname'){
		postMessage({ "type":"command", "name":"bg", "colorname":node.color.name });
	}
	else if(node.color.type === 'colorindex'){
		visitNode(node.color.children[0]);
		colorIndex = stack.pop();
		postMessage({ "type":"command", "name":"bg", "colorindex":colorIndex });
	}
	_test();
	return Promise.resolveLater();
}

function visitthickstmt(node){
	return visitchildren(node)
	.then(function(){
		_test();
		var thick = stack.pop();
		postMessage({ "type":"command", "name":"thick", "amount":thick });
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitbooleanstmt(node){
	return visitNode(node.toEval)
	.then(function(){
		_test();
		var istrue = stack.pop();
		if(istrue === 1){
			return visitchildren( node.iftrue );
		}
		else{
			return Promise.resolveLater();
		}
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitstopstmt(node){
	throw new Error("stop");
}

function visitcompoundbooleanstmt(node){
	return visitNode(node.toEval)
	.then(function(){
		var istrue = stack.pop();
		_test();
		if(istrue === 1){
			return visitchildren( node.iftrue );
		}
		else{
			return visitchildren( node.iffalse );
		}
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitbooleanval(node){
	var ch, op, makePromise;
	ch = node.children;
	op = node.op;
	makePromise = function(i){
		return new Promise(function(resolve, reject){
			return visitNode(ch[i]);
		});
	};
	return Promise.each([0, 1], makePromise)
	.then(function(){
		_test();
		var rhs = stack.pop(), lhs = stack.pop();
		lhs = parseFloat(lhs, 10);
		rhs = parseFloat(rhs, 10);
		if(op === "=" && lhs === rhs){
			stack.push(1);
		}
		else if(op === "<" && lhs < rhs){
			stack.push(1);
		}
		else if(op === ">" && lhs > rhs){
			stack.push(1);
		}
		else if(op === "<=" && lhs <= rhs){
			stack.push(1);
		}
		else if(op === ">=" && lhs >= rhs){
			stack.push(1);
		}
		else if(op === "!=" && lhs !== rhs){
			stack.push(1);
		}
		else{
			stack.push(0);
		}
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitcolorstmt(node){
	var colorIndex;
	_test();
	if(node.color.type === 'colorname'){
		postMessage({ "type":"command", "name":"color", "colorname":node.color.name });
	}
	else if(node.color.type === 'colorindex'){
		visitNode(node.color.children[0]);
		colorIndex = stack.pop();
		postMessage({ "type":"command", "name":"color", "colorindex":colorIndex });
	}
	return Promise.resolveLater();
}

function visitexpression(node){
	return visitchildren(node)
	.then(function(){
		_test();
		var i, num  = 0;
		for(i = 0; i<node.children.length; i++){
			num += stack.pop();
		}
		stack.push(num);
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitmultexpression(node){
	return visitchildren(node)
	.then(function(){
		_test();
		var i, num  = 1;
		for(i = 0; i < node.children.length; i++){
			num *= stack.pop();
		}
		stack.push(num);
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitdivterm(node){
	return visitchildren(node)
	.then(function(){
		_test();
		var num = stack.pop();
		if(num === 0){
			postError("Division by zero");
		}
		else{
			stack.push(1/num);
		}
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitrpttargetsstmt(node){
	var ch, makePromise;
	ch = node.children[0];
	makePromise = function(t){
		return new Promise(function(resolve, reject){
			_test();
			symTable.setTarget(t);
			visitNode(ch).then(function(){
				resolveLater(resolve, reject);
			});
		});
	}
	return Promise.each(_targets, makePromise);
}

function visitrptstmt(node){
	var ch0, ch1, i = -1, makePromise;
	ch0 = node.children[0];
	ch1 = node.children[1];
	makePromise = function(i){
		return new Promise(function(resolve, reject){
			_test();
			symTable.add("repcount", i);
			console.log(JSON.stringify(ch1));
			visitNode(ch1).then(function(){
				resolveLater(resolve, reject);
			});
		});
	}
	return visitNode(ch0)
	.then(function(){
		_test();
		var num = parseInt(stack.pop(), 10);
		console.log(num);
		return Promise.each(_.range(num), makePromise);
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitunaryexpression(node){
	_test();
	return visitchildren(node);
}

function visitnumberexpression(node){
	_test();
	return visitchildren(node);
}

function visitnumber(node){
	_test();
	if(node.value === "random"){
		stack.push(Math.floor(Math.random() * 100));
	}
	else{
		stack.push(node.value);
	}
	return Promise.resolveLater();
}

function visitrtstmt(node){
	return visitchildren(node)
	.then(function(){
		_test();
		var amount = stack.pop();
		amount = amount % 360;
		postMessage({"type":"command", "name":"rt", "amount":amount });
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitltstmt(node){
	return visitchildren(node)
	.then(function(){
		_test();
		var amount = stack.pop();
		amount = amount % 360;
		postMessage({"type":"command", "name":"rt", "amount": -1 * amount });
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visittimesordivterms(node){
	return visitchildren(node)
	.then(function(){
		_test();
		var ch = node.children;
		var l = ch.length;
		// now there are 'l' values on the stack.
		var num  = 1;
		for(var i = 0; i < l; i++){
			num *= stack.pop();
		}
		stack.push(num);
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visittimesordivterm(node){
	_test();
	return visitchildren(node);
}

function visittimesterm(node){
	_test();
	return visitchildren(node);
}

function visitplusorminus(node){
	_test();
	return visitchildren(node);
}

function visitoutsidefnlist(node){
	_test();
	return visitchildren(node);
}

function visitinsidefnlist(node){
	_test();
	return visitchildren(node);
}

function visitplusexpression(node){
	_test();
	return visitchildren(node);
}

function visitusevar(node){
	var num = symTable.get(node.name);
	_test();
	if(num === null || num === undefined){
		postError("Variable '"+node.name+"' not found.");
	}
	else{
		stack.push(num);
	}
	return Promise.resolveLater();
}

function visitsetxy(node){
	return visitchildren(node)
	.then(function(){
		_test();
		var amountY = stack.pop();
		var amountX = stack.pop();
		postMessage({ "type":"command", "name":"setxy", "amountX":amountX, "amountY":amountY });
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitlabelstmt(node){
	var child, contents;
	_test();
	child = node.children[0];
	if(typeof child === 'object' && child.type && child.type === "expression"){
		visitNode(child);
		contents = stack.pop();
		contents = parseFloat(contents, 10);
		contents = Number(contents.toFixed(4));
		contents = "" + contents;
	}
	else{
		contents = child; // a string
	}
	if(contents.length > 16){
		contents = contents.substring(0, 16);
	}
	postMessage({ "type":"command", "name":"label", "contents": contents});
	return Promise.resolveLater();
}

function visitsqrtexpression(node){
	return visitchildren(node)
	.then(function(){
		_test();
		var amount = stack.pop();
		if(amount >= 0){
			stack.push(Math.sqrt(amount));
		}
		else{
			postError("You took the square root of a negative number");
		}
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitsinexpression(node){
	return visitchildren(node)
	.then(function(){
		_test();
		var amount = stack.pop();
		stack.push(Math.sin(amount*Math.PI/180));
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitcosexpression(node){
	return visitchildren(node)
	.then(function(){
		_test();
		var amount = stack.pop();
		stack.push(Math.cos(amount*Math.PI/180));
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visittanexpression(node){
	return visitchildren(node)
	.then(function(){
		_test();
		var amount = stack.pop();
		stack.push(Math.tan(amount*Math.PI/180));
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitminusexpression(node){
	return visitchildren(node)
	.then(function(){
		_test();
		var num = stack.pop();
		stack.push(-1*num);
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitdefinefnstmt(node){
	_test();
	var name = node.name;
	var argsNode = node.args;
	var statementsNode = node.stmts;
	symTable.addFunction(name, argsNode, statementsNode);
	return Promise.resolveLater();
}

function visitnegate(node){
	return visitchildren(node)
	.then(function(){
		_test();
		var num = stack.pop();
		stack.push(-1*num);
	})
	.catch(function(e){
		postError("caught : " + e);
	});
}

function visitactivatedaemonstmt(node){
	symTable.activateDaemon(node.name);
}

function visitcallfnstmt(node){
	var name = node.name, args = "input argument";
	var f = symTable.getFunctionByName(name);
	if(f){
		var numSupplied, numArgs = 0;
		if(f.argsNode){
			numArgs = f.argsNode.children.length;
		}
		numSupplied = node.args.children.length;
		if(numArgs != numSupplied){
			if(numArgs == 0 || numArgs >= 2){
				args += "s"
			}
			postError("Function '"+name+"' has "+numArgs+" "+args+", but you sent "+numSupplied);
		}
		else{
			symTable.enterBlock();
			visitchildren(node.args)
			.then(function(){
				_test();
				return executeFunction(f)
					.then(function(){
						_test();
						symTable.exitBlock();
					})
					.catch(function(e){
						if(e.message === "stop"){
							console.log("caught stop");
						}
						else{
							postError(e.message);
						}
					});
			});
		}
	}
	else{
		postError("Function '"+name+"' not found");
	}
}

function executeFunction(f){
	var i, vals, len, argNode, varName;
	vals = [ ];
	if(f.argsNode){
		len = f.argsNode.children.length;
		for(i = 0; i <= len - 1; i++){
			vals.push(stack.pop());
		}
	}
	for(i = 0; i <= len - 1; i++){
		argNode = f.argsNode.children[i];
		varName = argNode.name;
		symTable.add(varName, vals[len - 1 - i]);
	}
	_test();
	return visitNode(f.statementsNode);
}

function visitNode(node){
	var t = node.type;
	if(t=="start"){
		return visitstart(node);
	}
	else if(t=="insidestmt"){
		return visitinsidestmt(node);
	}
	else if(t=="penupstmt"){
		return visitpenupstmt(node);
	}
	else if(t=="homestmt"){
		return visithomestmt(node);
	}
	else if(t=="pendownstmt"){
		return visitpendownstmt(node);
	}
	else if(t == "definefnstmt"){
		return visitdefinefnstmt(node);
	}
	else if(t == "callfnstmt"){
		return visitcallfnstmt(node);
	}
	else if(t=="fdstmt"){
		return visitfdstmt(node);
	}
	else if(t=="arcstmt"){
		return visitarcstmt(node);
	}
	else if(t=="arcrtstmt"){
		return visitarcrtstmt(node);
	}
	else if(t=="arcltstmt"){
		return visitarcltstmt(node);
	}
	else if(t=="bkstmt"){
		return visitbkstmt(node);
	}
	else if(t=="rtstmt"){
		return visitrtstmt(node);
	}
	else if(t=="ltstmt"){
		return visitltstmt(node);
	}
	else if(t=="rptstmt"){
		return visitrptstmt(node);
	}
	else if(t=="rpttargetsstmt"){
		return visitrpttargetsstmt(node);
	}
	else if(t=="makestmt"){
		return visitmakestmt(node);
	}
	else if(t=="expression"){
		return visitexpression(node);
	}
	else if(t=="insidefnlist"){
		return visitinsidefnlist(node);
	}
	else if(t=="outsidefnlist"){
		return visitoutsidefnlist(node);
	}
	else if(t=="expression"){
		return visitexpression(node);
	}
	else if(t=="multexpression"){
		return visitmultexpression(node);
	}
	else if(t=="plusorminus"){
		return visitplusorminus(node);
	}
	else if(t=="plusexpression"){
		return visitplusexpression(node);
	}
	else if(t=="minusexpression"){
		return visitminusexpression (node);
	}
	else if(t=="unaryexpression"){
		return visitunaryexpression(node);
	}
	else if(t=="timesordivterms"){
		return visittimesordivterms(node);
	}
	else if(t=="timesordivterm"){
		return visittimesordivterm(node);
	}
	else if(t=="timesterm"){
		return visittimesterm(node);
	}
	else if(t=="bgstmt"){
		return visitbgstmt(node);
	}
	else if(t=="colorstmt"){
		return visitcolorstmt(node);
	}
	else if(t=="plusexpression"){
		return visitplusexpression(node);
	}
	else if(t=="multexpression"){
		return visitmultexpression(node);
	}
	else if(t=="negate"){
		return visitnegate(node);
	}
	else if(t=="numberexpression"){
		return visitnumberexpression(node);
	}
	else if(t=="divterm"){
		return visitdivterm(node);
	}
	else if(t=="number"){
		return visitnumber(node);
	}
	else if(t=="number"){
		return visitnumber(node);
	}
	else if(t=="thickstmt"){
		return visitthickstmt(node);
	}
	else if(t=="booleanstmt"){
		return visitbooleanstmt(node);
	}
	else if(t=="stopstmt"){
		return visitstopstmt(node);
	}
	else if(t=="compoundbooleanstmt"){
		return visitcompoundbooleanstmt(node);
	}
	else if(t=="booleanval"){
		return visitbooleanval(node);
	}
	else if(t=="usevar"){
		return visitusevar(node);
	}
	else if(t=="setxy"){
		return visitsetxy(node);
	}
	else if(t=="sqrtexpression"){
		return visitsqrtexpression(node);
	}
	else if(t=="sinexpression"){
		return visitsinexpression(node);
	}
	else if(t=="cosexpression"){
		return visitcosexpression(node);
	}
	else if(t=="tanexpression"){
		return visittanexpression(node);
	}
	else if(t=="labelstmt"){
		return visitlabelstmt(node);
	}
	else if(t=="activatedaemonstmt"){
		return visitactivatedaemonstmt(node);
	}
	else{
		throw "unknown";
	}
}

function setup(){
	var setupTarget = function(target){
		var fns;
		symTable.setTarget(target);
		fns = symTable.getSetupForTargetType(target.getType());
		return Promise.each(fns, executeFunction);
	};
	return Promise.each(_targets, setupTarget);
}

function rundaemons(){
	var tick, loop, tickTarget;
	tickTarget = function(target){
		var fns;
		symTable.setTarget(target);
		fns = symTable.getActiveDaemonsForTargetType(target.getType());
		return Promise.each(fns, executeFunction);
	};
	tick = function(){
		return Promise.each(_targets, tickTarget);
	};
	loop = function(){
		return tick().then(function(){
			return _delay().then(loop);
		});
	};
	return loop();
}

module.exports = {
	"start": function(tree, consumer, targets){
		_active = true;
		_consumer = consumer;
		_targets = _parseTargets(targets);
		stack = new Stack();
		symTable = new SymTable();
		return visitNode(tree)
			.then(setup)
			.then(rundaemons);
	},
	"stop":function(){
		_active = false;
	}
};
