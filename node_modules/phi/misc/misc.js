var util = require('util');
var ugl = require('uglify-js');

var result = ugl.parse('(function(){a=1+2;})()');

console.log(result.TYPE);

for(var i = 0; i < result.body.length; i++) {
  var node = result.body[i];
  console.log('  ' + node.TYPE);
  
  for(var i = 0; i < result.body.length; i++) {
}