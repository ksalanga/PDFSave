export class CodeError extends Error {
   constructor(message, code) {
    super(message);
    this.code = code;
   }
}