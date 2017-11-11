const fs = 				require('fs');
const browserify = 		require('browserify');
const b = 				browserify('./src/Logo.js', {standalone: 'Logo'});

const FILENAME = __dirname + '/Logo.js';

var stream = b.bundle().pipe(fs.createWriteStream(FILENAME));
stream.on('finish', function () {
    fs.readFile(FILENAME, 'utf8', function (err,data) {
        fs.writeFile(FILENAME, data.replace(/%%VERSION%%/g, '' + new Date(Date.now()).toLocaleString()), 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
});
