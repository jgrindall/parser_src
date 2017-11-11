const Logo = 				require('./Logo.js');
const STR =                 "rpttargets [fd 1]";

console.log(JSON.stringify(Logo.getTree(STR)));

Logo.draw(STR, {consume:function(cmd){
    if(cmd.type === "command"){
        console.log(cmd);
    }
    else if(cmd.type === "error"){
        console.log("ERROR", cmd);
    }
}})
.then(function(){
    console.log('done');
})
.catch(function(){
    console.log('error', arguments);
});
