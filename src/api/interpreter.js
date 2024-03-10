import antlr4, { BailErrorStrategy } from "antlr4"
import arithListener from "../parser/arithListener.js"
import arithLexer from "../parser/arithLexer.js"
import arithParser from "../parser/arithParser.js"
import arithVisitor from "../parser/arithVisitor.js"

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
    return this.visit(ctx.expr());
  }

  // Visit a parse tree produced by arithParser#opExpr.
  visitOpExpr(ctx) {
    const left = this.visit(ctx.left);
    const right = this.visit(ctx.right);
    const op = ctx.getChild(1).getText();
    switch (op) {
      case '*': return left * right;
      case '/': return left / right;
      case '+': return left + right;
      case '-': return left - right;
      default: throw new Error("undefined operator")
    }
  }

  // Visit a parse tree produced by arithParser#assExpr.
  visitAssExpr(ctx) {
    const left = ctx.getChild(0).getText();
    const right = this.visit(ctx.right);
    memory.set(left, right);
    return right;
  }

  // Visit a parse tree produced by arithParser#atomExpr.
  visitAtomExpr(ctx) {
    return this.visit(ctx.atom());
  }


  // Visit a parse tree produced by arithParser#parenExpr.
  visitParenExpr(ctx) {
    return this.visit(ctx.expr());
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




