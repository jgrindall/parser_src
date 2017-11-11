const Logo = 				require('./Logo.js');


Logo.draw("rpttargets [fd 1]", {consume:function(cmd){
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