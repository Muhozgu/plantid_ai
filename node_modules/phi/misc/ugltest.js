var ugl = require('uglify-js');

var body = [];

var addDef = new ugl.AST_Function({
  name: new ugl.AST_SymbolDefun({ name: 'addNums' }),
  argnames: [
    new ugl.AST_SymbolFunarg({ name: 'numA' }),
    new ugl.AST_SymbolFunarg({ name: 'numB' })
  ],
  body: [
    new ugl.AST_Return({
      value: new ugl.AST_Binary({
        operator: '+',
        left: new ugl.AST_SymbolRef({ name: 'num1' }),
        right: new ugl.AST_SymbolRef({ name: 'num2' })
      })
    })
  ]
});

var top = new ugl.AST_Toplevel({ body: [addDef] });

top.figure_out_scope();
var code = top.print_to_string();

console.log('\nOUTPUT:\n');
console.log(code);