// NEXT TIME USE TYPESCRIPT!

export const incorrectStringFormat = (s) => {return typeof(s) !== 'string' || s === ''}

export const notInteger = (n) => {return !Number.isInteger(n)}

export const notBoolean = (b) => {return typeof(b) !== 'boolean'}