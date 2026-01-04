function gen(node) {
  if(!node) {
    return '';
  }
  
  var id = node[0];
  var fn = gens[id];
  
  if(fn) {
    return fn.apply(this, node);
  } else {
    return node;
  }
}

var gens = {};

gens['fn'] = function(id, args) {
  var argstr = args.join(', ');
  var stmtNodes = Array.prototype.slice.call(arguments, 2);
  var blockNode = ['block'].concat(stmtNodes);
  return '(function (' + argstr + ') ' + gen(blockNode) + ')';
},

gens['ret'] = function(id, exprNode) {
  return 'return ' + gen(exprNode);
};

gens['arg'] = function(id, numNode) {
  return 'arguments[' + gen(numNode) + ']';
};

gens['nargs'] = function(id) {
  return 'arguments.length';
};

gens['load'] = function(id, localName) {
  return localName;
};

gens['infix'] = gens['+'] = function(id, token, nodeA, nodeB) {
  return '(' + gen(nodeA) + ' ' + token + ' ' + gen(nodeB) + ')';
};

gens['postfix'] = gens['+'] = function(id, token, node) {
  return '(' + gen(node) + token + ')';
};

gens['prefix'] = gens['+'] = function(id, token, node) {
  return '(' + token + gen(node) + ')';
};

gens['stmt'] = function(id, codeNode) {
  return gen(codeNode) + ';';
};

gens['block'] = function(id) {
  var str = '{ ';
  for(var i = 1; i < arguments.length; i++) {
    str += gen(arguments[i]) + '; ';
  }
  str += '}';
  return str;
};

gens['var'] = function(id) {
  var defs = [];
  for(var i = 1; i < arguments.length; i++) {
    var arg = arguments[i];
    if(Array.isArray(arg) && arg.length >= 2) {
      defs.push(arg[0] + ' = ' + gen(arg[1]));
    } else {
      defs.push(arg + '');
    }
  }
  return 'var ' + defs.join(', ');
};

gens['lit'] = function(id, lit) {
  if(Object.prototype.toString.call(lit) == '[object String]') {
    return "'" + lit + "'";
  } else {
    return lit + '';
  }
};

gens['for'] = function(id, initNode, condNode, postNode, stmtNode) {
  var head = gen(initNode) + '; ' + gen(condNode) + '; ' + gen(postNode);
  return 'for (' + head + ') ' + gen(stmtNode);
};

gens['access'] = function(id, objNode, memberNode) {
  return gen(objNode) + '[' + gen(memberNode) + ']';
};

gens['call'] = function(id, fnNode) {
  var args = [];
  for(var i = 2; i < arguments.length; i++) {
    args.push(gen(arguments[i]));
  }
  return gen(fnNode) + '(' + args.join(', ') + ')';
};


function compile(fnNode) {
  var code = gen(fnNode);
  return eval(code);
}

var defAdd = ['fn', ['a', 'b'],
  ['ret', ['infix', '+', ['load', 'a'], ['load', 'b']]]
];

var defPrint = ['fn', [],
  ['var', ['str', ['lit', '']]],
  ['for',
    ['var', ['i', ['lit', 0]]],
    ['infix', '<', ['load', 'i'], ['nargs']],
    ['postfix', '++', ['load', 'i']],
    ['block',
      ['infix', '+=',
        ['load', 'str'],
        ['infix', '+',
          ['arg', ['load', 'i']],
          ['lit', ' ']
        ]
      ]
    ]
  ],
  ['call', ['access', ['load', 'console'], ['lit', 'log']],
    ['load', 'str']
  ]
];


var addFn = compile(defAdd);

var printFn = compile(defPrint);

console.log( gen(defPrint) );

printFn("what's", 'up', 'doc?');



