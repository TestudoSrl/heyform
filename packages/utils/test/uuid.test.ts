import { expect, test } from 'vitest'

import { helper, uuidv4, uuidv5 } from '../src'

test('uuidv4', () => {
  expect(helper.isUUID(uuidv4())).toBe(true)
})

test('uuidv5', () => {
  const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
  expect(helper.isUUID(uuidv5('hello', namespace))).toBe(true)
})
