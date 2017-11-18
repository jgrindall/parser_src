const Logo = require('./Logo.js');

var STR =      "";

var STR =   "to test fd 1 end";

//STR +=      "to setup-rabbit rt 90 activate-daemon daemon-rabbit-eat end";

STR +=      "to setup-robot set-var age 0 test  end";

//STR +=      "to setup-rabbit rt 90 activate-daemon daemon-rabbit-eat end";

//STR +=      "to setup-robot set-var age 0 setxy 0 0 end";

//STR +=      "to daemon-robot-walk fd 1 end";

//STR +=      "to daemon-robot-walk end";

//STR +=      "to daemon-rabbit-eat rt 10 end";

console.log(JSON.stringify(Logo.getTree(STR)));

var targets = [
    {"type":"robot", "pos":{"x":0, "y":0}, "angle":0},
    {"type":"robot", "pos":{"x":0, "y":0}, "angle":0}
];

Logo.draw(STR, {consume:function(cmd){
    if(cmd.type === "command"){
        console.log('cmd', cmd);
    }
    else if(cmd.type === "error"){
        console.log("ERROR", cmd);
    }
}}, targets)
.then(function(){
    console.log('done');
})
.catch(function(){
    console.log('error', arguments);
});
