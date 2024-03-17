import antlr4, { BailErrorStrategy } from "antlr4"
import arithListener from "../parser/arithListener.js"
import arithLexer from "../parser/arithLexer.js"
import arithParser from "../parser/arithParser.js"
import arithVisitor from "../parser/arithVisitor.js"
import { log } from "../config.js";

const memory = new Map();
/**
 * @param {string} s 
 * @returns {string}
 */
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
    const left = JSON.stringify(this.visit(ctx.stmt()).value);
    if (ctx.prog() === null)
      return left;
    const right = this.visit(ctx.prog()).value;
    return `${left}\n${right}`;
  }

  /**
   * 
   * @param {*} ctx 
   * @returns {{value: any, type: string}}
   */
  // Visit a parse tree produced by arithParser#funcBody.
  visitFuncBody(ctx) {
    return this.visitChildren(ctx);
  }

  /**
   * 
   * @param {*} ctx 
   * @returns {{value: any, type: string}}
   */
  // Visit a parse tree produced by arithParser#assStmt.
  visitAssStmt(ctx) {
    const left = ctx.getChild(0).getText();
    const right = this.visit(ctx.right);
    memory.set(left, right);
    return right;
  }

  /**
   * 
   * @param {*} ctx 
   * @returns {{value: any, type: string}}
   */
  // Visit a parse tree produced by arithParser#assfStmt.
  visitAssfStmt(ctx) {
    const left = ctx.getChild(0).getText();
    const right = this.visit(ctx.right);
    memory.set(left, right);
    return right;
  }

  /**
   * 
   * @param {*} ctx 
   * @returns {{value: any, type: string}}
   */
  // Visit a parse tree produced by arithParser#unAssStmt.
  visitUnAssStmt(ctx) {
    return { value: memory.delete(ctx.getChild(1).getText()) + 0, type: "num" };
  }

  /**
   * 
   * @param {*} ctx 
   * @returns {{value: any, type: string}}
   */
  // Visit a parse tree produced by arithParser#exprStmt.
  visitExprStmt(ctx) {
    return this.visit(ctx.expr());
  }

  /**
   * 
   * @param {*} ctx 
   * @returns {{value: any, type: string}}
   */
  // Visit a parse tree produced by arithParser#pureFunc.
  visitPureFunc(ctx) {
    return this.visitChildren(ctx);
  }

  /**
   * 
   * @param {*} ctx 
   * @returns {{value: any, type: string}}
   */
  // Visit a parse tree produced by arithParser#unpureFunc.
  visitUnpureFunc(ctx) {
    return this.visitChildren(ctx);
  }

  /**
   * 
   * @param {*} ctx 
   * @returns {{value: any, type: string}}
   */
  // Visit a parse tree produced by arithParser#arglist.
  visitArglist(ctx) {
    return this.visitChildren(ctx);
  }

  /**
   * 
   * @param {*} ctx 
   * @returns {{value: any, type: string}}
   */
  // Visit a parse tree produced by arithParser#arrayExpr.
  visitArrayExpr(ctx) {
    return this.visit(ctx.array());
  }

  /**
   * 
   * @param {*} ctx 
   * @returns {{value: any, type: string}}
   */
  // Visit a parse tree produced by arithParser#opExpr.
  visitBOpExpr(ctx) {
    var left = this.visit(ctx.left);
    var right = this.visit(ctx.right);
    const op = ctx.getChild(1).getText();
    if (left.type !== "num" || right.type !== "num") {
      throw new Error(`type error: ${left.type} ${op} ${right.type}`)
    }
    left = left.value;
    right = right.value;
    let out = { value: null, type: "num" }
    switch (op) {
      case '*': out.value = left * right; break;
      case '/': out.value = left / right; break;
      case '+': out.value = left + right; break;
      case '-': out.value = left - right; break;
      case '>=': out.value = (left >= right) + 0; break;
      case '<=': out.value = (left <= right) + 0; break;
      case '>': out.value = (left > right) + 0; break;
      case '<': out.value = (left < right) + 0; break;
      case '==': out.value = (left === right) + 0; break; // strict eq coz js is cringe
      case '!=': out.value = (left !== right) + 0; break;
      case '&&': out.value = (left && right) + 0; break;
      case '||': out.value = (left || right) + 0; break;
      default: throw new Error("undefined operator")
    }
    return out;
  }

  /**
   * 
   * @param {*} ctx 
   * @returns {{value: any, type: string}}
   */
  // Visit a parse tree produced by arithParser#uOpExpr.
  visitUOpExpr(ctx) {
    var left = this.visit(ctx.expr());
    const op = ctx.getChild(0).getText();
    if (left.type !== "num") {
      throw new Error(`type error: ${op}${left.type}`)
    }
    left = left.value;
    let out = { value: null, type: "num" }
    switch (op) {
      case '!': out.value = (!left) + 0; break;
      case '-': out.value = -left; break;
      default: throw new Error("undefined operator")
    }
    return out;
  }

  /**
   * 
   * @param {*} ctx 
   * @returns {{value: any, type: string}}
   */
  // Visit a parse tree produced by arithParser#ifExpr.
  visitIfExpr(ctx) {
    const { value } = this.visit(ctx.cond);
    if (value)
      return this.visit(ctx.t);
    else
      return this.visit(ctx.f);
  }

  /**
   * 
   * @param {*} ctx 
   * @returns {{value: any, type: string}}
   */
  // Visit a parse tree produced by arithParser#atomExpr.
  visitAtomExpr(ctx) {
    return this.visit(ctx.atom());
  }

  /**
   * 
   * @param {*} ctx 
   * @returns {{value: any, type: string}}
   */
  // Visit a parse tree produced by arithParser#parenExpr.
  visitParenExpr(ctx) {
    return this.visit(ctx.expr());
  }

  /**
   * 
   * @param {*} ctx 
   * @returns {{value: any, type: string}}
   */
  // Visit a parse tree produced by arithParser#oneDimArr.
  visitArrDecl(ctx) {
    const zeroOrOne = ctx.zo;
    const one = ctx.o;
    const mul = ctx.mul;
    if (zeroOrOne === null && one === null) {
      return { value: [], type: "arr" };
    } else if (one === null) {
      const { value } = this.visit(zeroOrOne);
      return { value: [value], type: "arr" };
    } else {
      const fst = this.visit(one);
      const snd = this.visit(mul);
      return { value: [fst.value].concat(snd.value), type: "arr" };
    }
  }

  /**
   * 
   * @param {*} ctx 
   * @returns {{value: any, type: string}}
   */
  // Visit a parse tree produced by arithParser#atomInt.
  visitAtomInt(ctx) {
    return { value: parseInt(ctx.getText()), type: "num" };
  }

  /**
   * 
   * @param {*} ctx 
   * @returns {{value: any, type: string}}
   */
  // Visit a parse tree produced by arithParser#atomFloat.
  visitAtomFloat(ctx) {
    return { value: parseFloat(ctx.getText()), type: "num" };
  }

  /**
   * 
   * @param {*} ctx 
   * @returns {{value: any, type: string}}
   */
  // Visit a parse tree produced by arithParser#atomVar.
  visitAtomVar(ctx) {
    if (memory.has(ctx.getText())) {
      return memory.get(ctx.getText());
    }
    throw new Error("undeclared identifier");
  }
}




