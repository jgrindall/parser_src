const Logo = 				require('./Logo.js');
const STR =                 "to test fd 1 end rpttargets [test]";

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



/*
robot
------

init
	setxy  0 0
end

to d0
  	fd1
end

to d1
  	bk1
end

to d2
  	rt 90 fd1
end

*/

write to

/*
	
rpttargets
	init
end

to rpt-robots
	init-robot
end

while true
	rpttargets[
		d0 d1 d2
	]
end

*/




