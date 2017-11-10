const fs = 				require('fs');
const browserify = 		require('browserify');
const b = 				browserify('./src/Logo.js', {standalone: 'Logo'});

b.bundle().pipe(fs.createWriteStream(__dirname + '/Logo.js'));