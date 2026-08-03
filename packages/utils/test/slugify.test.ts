import { expect, test } from 'vitest'

import { slugify } from '../src'

test('slugify', () => {
  expect(slugify('/user/sign/in')).toBe('usersignin')
  expect(slugify('Hello World')).toBe('hello_world')
  expect(slugify('Hello World', { replacement: '-' })).toBe('hello-world')
})

test('slugify empty string', () => {
  expect(slugify('')).toBe('')
})

test('slugify with lower disabled', () => {
  expect(slugify('Hello World', { lower: false })).toBe('Hello_World')
})
