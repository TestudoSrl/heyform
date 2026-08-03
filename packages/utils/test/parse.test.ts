import { expect, test } from 'vitest'

import { htmlToText, parseBool, parseJson, parseNumber } from '../src'

test('json', () => {
  const value = parseJson('{"a": 1}')
  expect(value).toStrictEqual({
    a: 1
  })
})

test('empty json string', () => {
  const value = parseJson('')
  expect(value).toBe(undefined)
})

test('invalid json string', () => {
  const defaultValue = {
    b: 2
  }
  const value = parseJson('{"a":', defaultValue)
  expect(value).toStrictEqual(defaultValue)
})

test('bool', () => {
  const value = parseBool(true)
  expect(value).toBe(true)
})

test('bool with nil', () => {
  const value = parseBool(null, true)
  expect(value).toBe(true)
})

test('bool with true string', () => {
  const value = parseBool('true')
  expect(value).toBe(true)
})

test('bool with number', () => {
  const value = parseBool(1)
  expect(value).toBe(true)
})

test('bool with string', () => {
  const value = parseBool('test')
  expect(value).toBe(false)
})

test('bool with false string', () => {
  const value = parseBool('false')
  expect(value).toBe(false)
})

test('init', () => {
  const value = parseNumber('10')
  expect(value).toBe(10)
})

test('init with default value', () => {
  const value = parseNumber(1, 10)
  expect(value).toBe(1)
})

test('init with default value and max value', () => {
  const value = parseNumber('a', 10, 30)
  expect(value).toBe(10)
})

test('init with max value', () => {
  const value = parseNumber('50', 10, 30)
  expect(value).toBe(30)
})

test('init with max value', () => {
  const value = parseNumber(100, 10, 30)
  expect(value).toBe(30)
})

test('init with invalid number', () => {
  const value = parseNumber('not-a-number')
  expect(value).toBe(undefined)
})

test('init with invalid number and default', () => {
  const value = parseNumber('not-a-number', 5)
  expect(value).toBe(5)
})

test('html to text', () => {
  expect(htmlToText('<a href="#">hello</a>')).toBe('hello')
})

test('html to text without limit', () => {
  expect(htmlToText('<strong>hello</strong>', 0)).toBe('hello')
})
