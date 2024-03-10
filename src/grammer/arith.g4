grammar arith;

prog: stmt ENDL? | stmt ENDL prog?;

funcBody: (stmt | RETURN expr) ENDL?
	| (stmt | RETURN expr) ENDL prog?;

stmt:
	left = VAR '=' right = expr		# assStmt
	| left = VAR '=' right = func	# assfStmt
	| '~' VAR						# unAssStmt
	| expr							# exprStmt;

func:
	'f(' VAR? '):' (expr | func)	# pureFunc
	| 'uf(' arglist '):' funcBody	# unpureFunc;

arglist: VAR? | VAR (',' VAR)+;

expr:
	op = (NOT | SUB) expr												# uOpExpr
	| left = expr op = (MUL | DIV) right = expr							# bOpExpr
	| left = expr op = (ADD | SUB) right = expr							# bOpExpr
	| left = expr op = (GT | GTE | LT | LTE | EQ | NEQ) right = expr	# bOpExpr
	| left = expr op = (AND | OR) right = expr							# bOpExpr
	| IF cond = expr THEN t = expr ELSE f = expr						# ifExpr
	| atom																# atomExpr
	| '[' array ']'														# arrayExpr
	| '(' expr ')'														# parenExpr;

array:
	zo = expr?							# arrDecl
	| (o = expr) (',' (mul = array))?	# arrDecl;

atom: INT # atomInt | FLOAT # atomFloat | VAR # atomVar;

ENDL: ';';
ADD: '+';
SUB: '-';
MUL: '*';
DIV: '/';
EQ: '==';
NEQ: '!=';
GT: '>';
GTE: '>=';
LT: '<';
LTE: '<=';
AND: '&&';
OR: '||';
NOT: '!';
IF: 'if';
THEN: 'then';
ELSE: 'else';
RETURN: 'ret';
NEWLINE: [\r\n]+;
INT: [0]| [1-9][0-9]*;
FLOAT: INT [.]INT;
VAR: [a-zA-Z][a-zA-Z0-9]*;