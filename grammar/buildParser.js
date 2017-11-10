const fs = 					require("fs");
const peg = 				require("pegjs");
const grammarString = 		fs.readFileSync("grammar.txt", 'utf8');
const parser = 				peg.generate(grammarString, {"output":"source", "format":"umd"});

fs.writeFileSync("../Parser.js", parser, 'utf8');
