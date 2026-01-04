var Phi = {};

Phi.ParseShape = function(data, matchFn, procFn) {
  
};

Phi.PSInstance = function(shape, data) {
  
};

Phi.ParseRule = function(preShape, token, postShape, procFn) {
  
};

Phi.ParseContext = function(parent, rules) {
  this.parent = parent;
};

Phi.Tokens = {
  LParen: '(',
  RParen: ')',
  LBrace: '{',
  RBrace: '}',
  LAngle: '<',
  RAngle: '>',
  LBracket: '[',
  RBracket: ']'
};

Phi.Shapes = {};

Phi.Shapes.Region = new Phi.ParseShape(
  function() {
    
  },
  function() {
    
  });
  
Phi.Shapes.Expression = new Phi.ParseShape(
  function() {
    
  },
  function() {
    
  });
  
Phi.Shapes.Items = new Phi.ParseShape(
  function() {
    
  },
  function() {
    
  });
  
Phi.Shapes.Tuple = new Phi.ParseShape(
  { items: Phi.Shapes.Items },
  function() {
    
  },
  function() {
    
  });


Phi.tokenize = function(text) {
  
};

Phi.parse = function(tokens) {
  
};

Phi.compile = function(text) {
  var tokens = Phi.tokenize(text);
  var ast = Phi.parse(tokens);
  
  return ast;
};


var result = Phi.compile('<5, 10, 15>');


