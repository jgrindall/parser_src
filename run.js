const Logo = 				require('./Logo.js');
const STR =                 "to test fd 1 end to robot-setup setxy 0 0 end to robot-daemon fd 1 end";

console.log(JSON.stringify(Logo.getTree(STR)));

Logo.draw(STR, {consume:function(cmd){
    if(cmd.type === "command"){
        console.log('cmd', cmd);
    }
    else if(cmd.type === "error"){
        console.log("ERROR", cmd);
    }
}}, [0, 1, 2, 3, 4])
.then(function(){
    console.log('done');
})
.catch(function(){
    console.log('error', arguments);
});

