export class CodeError extends Error {
   // generic Code Error module
   constructor(message, code) {
    super(message);
    this.code = code;
   }
}