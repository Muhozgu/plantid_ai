var ugl = require('uglify-js');

var NodeTypes = [
  { type: 'fn',
    supr: 'expr',
    shape: { args: '[idnt]', code: 'stmt' },
    gen: function(node) {
      return '(function(' + node.args.join(', ') + '){ ' + genNode(node.block) + '})';
    }
  },
  { type: 'block',
    gen: function(node) {
      var stmts = '';
      for(var i = 0; i < node.stmts.length; i++) {
        stmts += genNode(node.stmts[i]) + '; ';
      }
      return '{ ' + stmts + '}';
    }
  },
  { type: 'prefix',
    gen: function(node) {
      return node.op + ' ' + genNode(node.expr);
    }
  },
  { type: 'infix',
    gen: function(node) {
      return genNode(node.lexpr) + ' ' + node.op + ' ' + genNode(node.rexpr);
    }
  },
  { type: 'idnt',
    gen: function(node) {
      return node.val;
    }
  }
];

function getNodeType(type) {
  for(var i = 0; i < NodeTypes.length; i++)
    if(NodeTypes[i].type == type)
      return NodeTypes[i];
  return null;
}

function genNode(node) {
  var nt = getNodeType(node.type);
  if(!nt) {
    throw 'Node type "'+node.type+'" not found.';
  }
  return nt.gen(node);
}


function compile(node) {
  var js = genNode(node);
  console.log(js);
  
  var min = ugl.minify(js, { fromString: true, compress: false });
  console.log(min);
}


var addDef = { type: 'fn', args: ['n1', 'n2'],
  block: { type: 'block', stmts: [
    { type: 'prefix', op: 'return',
      expr: { type: 'infix', op: '+',
        lexpr: { type: 'idnt', val: 'n1' },
        rexpr: { type: 'idnt', val: 'n2' }
      }
    }
  ]}
};

compile(addDef);