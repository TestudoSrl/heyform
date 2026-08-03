import { expect, test } from 'vitest'

import { clsx } from '../src'

test('clsx merges class names', () => {
  expect(clsx('p-2', 'p-4', 'text-sm')).toBe('p-4 text-sm')
})
