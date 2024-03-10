grammar arith;

prog:   stmt ';' prog*;

funcBody: (stmt | RETURN expr) ';' prog*;

stmt:   left=VAR '=' right=expr  # assStmt
    |   left=VAR '=' right=func  # assfStmt
    |   '~' VAR                  # unAssStmt
    |   expr                     # exprStmt
    ;

func:   'f(' VAR? '):' (expr | func)       # pureFunc
    |   'uf(' arglist '):' funcBody        # unpureFunc
    ;

arglist: VAR? | VAR (',' VAR)+;

expr:   left=expr op=('*'|'/') right=expr # opExpr
    |   left=expr op=('+'|'-') right=expr # opExpr
    |   atom                              # atomExpr
    |   array                             # arrayExpr
    |   '(' expr ')'                      # parenExpr
    ;

array: '[' ((atom)? | (atom) (',' (atom))+)']'    # oneDimArr
     | '[' (array? | (array) (',' (array))+) ']'  # nDArr
     ;

atom: INT       #atomInt
    | FLOAT     #atomFloat
    | VAR       #atomVar
    ;

RETURN  : 'ret';
NEWLINE : [\r\n]+ ;
INT     : [0]|[1-9][0-9]* ;
FLOAT   : INT[.]INT;
VAR     : [a-zA-Z][a-zA-Z0-9]*;