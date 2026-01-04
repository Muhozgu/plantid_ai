var fs = require('fs');
var util = require('util');
var parser = require('../peg/parser/phi');


var filename = 'demo';


console.log('loading .phi file...');
var data = fs.readFileSync('ex/'+filename+'.phi', 'utf-8');

console.log('parsing...');
var json = util.inspect(parser.parse(data), false, 1000);

console.log('saving json...');
fs.writeFileSync('ex/ast/'+filename+'.json', json, 'utf-8');

console.log('done.');