var parse = require('scriptparser');
var fs = require('fs');

parse(fs.readFileSync('www/index.html'));
