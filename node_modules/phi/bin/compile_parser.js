var fs = require('fs');
var peg = require('pegjs');
var ugl = require('uglify-js');


var min = false;
var filename = 'phi';


console.log('loading grammar...');
var grammar = fs.readFileSync('peg/'+filename+'.peg', 'utf-8');

console.log('building parser...');
var parser = peg.buildParser(grammar);

console.log('rendering parser source...');
var source = 'module.exports = ' + parser.toSource() + ';';

if(min) {
  console.log('compressing parser source...');
  source = ugl.minify(source, {
    fromString: true,
    output: { max_line_len: 160 }
  }).code;
}

console.log('saving parser...');
fs.writeFileSync('peg/parser/'+filename+'.js', source, 'utf-8');

console.log('done.');