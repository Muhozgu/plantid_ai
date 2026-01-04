var fs = require('fs');
var util = require('util');

var ugl = require('uglify-js');
var parser = require('../peg/parser/phi');


var Passes = [/*'macros', 'shapes',*/ 'build'];

var Childs = {
  Shell: ['body'],
  Spell: ['args'],
  List: ['items'],
  Hash: ['pairs'],
  Pair: ['key', 'val']
};

var Spells = {
  'jsbo': function() {  // 'JavaScript Binary Operator'
    var op = arguments[0].val;
    var args = Array.prototype.slice.call(arguments, 1);
    var node = args[0];
    for(var i=1; i<args.length; i++) {
      node = new ugl.AST_Binary({ operator: op, left: node, right: args[i] });
    }
    return node;
  },
  'call': function(expr) {
    var args = Array.prototype.slice.call(arguments, 1);
    return new ugl.AST_Call({ expression: expr, args: args });
  },
  'dot': function(expr, prop) {
    return new ugl.AST_Dot({ expression: expr, property: prop.name });
  }
};

function buildSpell(spell, args) {
  return Spells[spell].apply(this, args);
}


function wrapSS(node) {
  if(Array.isArray(node)) {
    for(var i=0; i<node.length; i++) 
      node[i] = wrapSS(node[i]);
    return node;
  }
  
  if(node.TYPE == 'SimpleStatement') {
    return node;
  }
  
  return new ugl.AST_SimpleStatement({ body: node });
}


var TypeProp = 'T';
var NodeTypes = {
  JSAST: {},
  Spell: {
    build: function(node) {
      return buildSpell(node.id, node.args);
    }
  },
  Shell: {
    build: function(node) {
      return wrapSS(new ugl.AST_Call({
        args: [],
        expression: new ugl.AST_Function({
          argnames: [],
          body: wrapSS(node.body)
        })
      }));
    }
  },
  Word: {
    build: function(node) {
      return new ugl.AST_SymbolRef({ name: node.val });
    }
  },
  Glyph: {
  },
  Num: {
    build: function(node) {
      return new ugl.AST_Number({ value: node.val });
    }
  },
  List: {
    shapes: function(node) {
      
    },
    build: function(node) {
      return new ugl.AST_Array({ elements: node.items });
    }
  }
};


var debug = false;

var padding = 0;

function doPass(pass, node) {
  var i;
  
  padding++;
  if(debug) {
    var pad = '';
    for(i=0; i<padding; i++) pad += '  ';
    console.log('[' + pass + ']' + pad + util.inspect(node, false, 1));
  }
  
  if(Array.isArray(node)) {
    for(i=0; i<node.length; i++) 
      node[i] = doPass(pass, node[i]);
    padding--;
    return node;
  }
  
  var type = NodeTypes[node[TypeProp]];
  var childs = Childs[node[TypeProp]];
  var passFn = type[pass];
  
  if(childs) {
    for(i=0; i<childs.length; i++)
      node[childs[i]] = doPass(pass, node[childs[i]]);
  }
  
  if(passFn) {
    padding--;
    return passFn(node);
  }
    
  padding--;
  return node;
}


function compile(node) {
  var i, n = Passes.length;
  for(i=0; i<n; i++) {
    node = doPass(Passes[i], node);
    
    if(debug){
      padding = 0;
      console.log(' ');
    }
  }
  
  var top = new ugl.AST_Toplevel({ body: [node] });
  top.figure_out_scope();
  return top.print_to_string({ beautify: true, indent_level: 2 });
}




var filename = 'demo';

console.log('loading .phi file...');
var data = fs.readFileSync('ex/'+filename+'.phi', 'utf-8');

console.log('parsing...');
var ast = parser.parse(data);

console.log('compiling...');
var source = compile(ast);

console.log('javascript:');
console.log(source);

console.log('executing...');
eval(source);

console.log('done.');