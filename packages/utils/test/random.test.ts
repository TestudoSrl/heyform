import { expect, test } from 'vitest'

import { random, randomAlpha, randomHexic, randomNumber, randomNumeric } from '../src'

const len = 6

test('alphanumeric', () => {
  const str = random(len)
  expect(str).toHaveLength(len)
})

test('alpha string', () => {
  const str = randomAlpha(len)
  expect(/^[A-Za-z]{6}$/.test(str)).toBe(true)
})

test('numeric string', () => {
  const str = randomNumeric(len)
  expect(/^[0-9]{6}$/.test(str)).toBe(true)
})

test('hex string', () => {
  const str = randomHexic(len)
  expect(/^[0-9a-f]{6}$/.test(str)).toBe(true)
})

test('random number in range', () => {
  const num = randomNumber(5, 10)
  expect(num).toBeGreaterThanOrEqual(5)
  expect(num).toBeLessThanOrEqual(10)
})
