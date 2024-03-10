import antlr4, { BailErrorStrategy } from "antlr4"
import arithListener from "../parser/arithListener.js"
import arithLexer from "../parser/arithLexer.js"
import arithParser from "../parser/arithParser.js"
import arithVisitor from "../parser/arithVisitor.js"
import {log} from "../config.js";

const memory = new Map();

export const interpret = (s) => {
  const chars = new antlr4.InputStream(s);
  const lexer = new arithLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new arithParser(tokens);
  // parser._errHandler = new BailErrorStrategy();
  try {
    const tree = parser.prog();
    if (parser.syntaxErrorsCount > 0)
      return "syntax error"
    return tree.accept(new Visitor());
  } catch (err) {
    return `${err.message}`;
  }
}

class Visitor extends arithVisitor {

  // Visit a parse tree produced by arithParser#prog.
  visitProg(ctx) {
    const left = JSON.stringify(this.visit(ctx.stmt()));
    if (ctx.prog() === null)
      return left;
    const right = this.visit(ctx.prog());
    return `${left}\n${right}`;
  }

	// Visit a parse tree produced by arithParser#funcBody.
	visitFuncBody(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by arithParser#assStmt.
	visitAssStmt(ctx) {
	  const left = ctx.getChild(0).getText();
    const right = this.visit(ctx.right);
    memory.set(left, right);
    return right;
	}


	// Visit a parse tree produced by arithParser#assfStmt.
	visitAssfStmt(ctx) {
	  return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by arithParser#unAssStmt.
	visitUnAssStmt(ctx) {
	  return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by arithParser#exprStmt.
	visitExprStmt(ctx) {
	  return this.visit(ctx.expr());
	}

	// Visit a parse tree produced by arithParser#pureFunc.
	visitPureFunc(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by arithParser#unpureFunc.
	visitUnpureFunc(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by arithParser#arglist.
	visitArglist(ctx) {
	  return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by arithParser#arrayExpr.
	visitArrayExpr(ctx) {
	  return this.visit(ctx.array());
	}

  // Visit a parse tree produced by arithParser#opExpr.
  visitBOpExpr(ctx) {
    const left = this.visit(ctx.left);
    const right = this.visit(ctx.right);
    // TODO: check array type...
    const op = ctx.getChild(1).getText();
    switch (op) {
      case '*': return left * right;
      case '/': return left / right;
      case '+': return left + right;
      case '-': return left - right;
      case '>=': return (left >= right) + 0;
      case '<=': return (left <= right) + 0;
      case '>': return (left > right) + 0;
      case '<': return (left < right) + 0;
      case '==': return (left === right) + 0; // strict eq coz js is cringe
      case '!=': return (left !== right) + 0;
      case '&&': return (left && right) + 0;
      case '||': return (left || right) + 0;
      default: throw new Error("undefined operator")
    }
  }

	// Visit a parse tree produced by arithParser#uOpExpr.
	visitUOpExpr(ctx) {
    const left = this.visit(ctx.expr());
    const op = ctx.getChild(0).getText();
    switch (op) {
      case '!': return (!left) + 0;
      case '-': return -left;
      default: throw new Error("undefined operator")
    }
	}

  // Visit a parse tree produced by arithParser#ifExpr.
	visitIfExpr(ctx) {
    const cond = this.visit(ctx.cond);
    if (cond)
      return this.visit(ctx.t);
    else
      return this.visit(ctx.f);
	}

  // Visit a parse tree produced by arithParser#atomExpr.
  visitAtomExpr(ctx) {
    return this.visit(ctx.atom());
  }


  // Visit a parse tree produced by arithParser#parenExpr.
  visitParenExpr(ctx) {
    return this.visit(ctx.expr());
  }

	// Visit a parse tree produced by arithParser#oneDimArr.
	visitArrDecl(ctx) {
    const zeroOrOne = ctx.zo;
    const one = ctx.o;
    const mul = ctx.mul;
    if (zeroOrOne === null && one === null) {
      return [];
    } else if (one === null) {
      return [ this.visit(zeroOrOne) ];
    } else {
      return [ this.visit(one) ].concat(this.visit(mul));
    }
	}

  // Visit a parse tree produced by arithParser#atomInt.
  visitAtomInt(ctx) {
    return parseInt(ctx.getText());
  }


  // Visit a parse tree produced by arithParser#atomFloat.
  visitAtomFloat(ctx) {
    return parseFloat(ctx.getText());
  }

  // Visit a parse tree produced by arithParser#atomVar.
  visitAtomVar(ctx) {
    if (memory.has(ctx.getText())) {
      return memory.get(ctx.getText());
    }
    throw new Error("undeclared identifier");
  }
}




