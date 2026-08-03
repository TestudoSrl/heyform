const NUMERIC = '0123456789'
const HEXIC = '0123456789abcdef'
const ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const ALPHANUMERIC = ALPHA + NUMERIC

export function random(len: number = 6, alphabet: string = ALPHANUMERIC): string {
  let result = ''
  const length = alphabet.length
  for (let i = 0; i < len; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * length))
  }
  return result
}

export function randomHexic(len: number): string {
  return random(len, HEXIC)
}

export function randomAlpha(len: number): string {
  return random(len, ALPHA)
}

export function randomNumeric(len: number): string {
  return random(len, NUMERIC)
}

export function randomNumber(min: number, max: number): number {
  return Math.ceil(Math.random() * (max - min) + min)
}
