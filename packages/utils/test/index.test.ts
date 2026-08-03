import { expect, test } from 'vitest'

import * as utils from '../src/index'

test('index re-exports utilities', () => {
  expect(typeof utils.pickObject).toBe('function')
  expect(typeof utils.random).toBe('function')
  expect(typeof utils.uuidv4).toBe('function')
  expect(utils.qs).toBeDefined()
})
