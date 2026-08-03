/* eslint-disable no-console */

export type TestFn = () => void | Promise<void>

interface TestCase {
  name: string
  fn: TestFn
}

export interface TestSuite {
  name: string
  tests: TestCase[]
}

export function defineSuite(name: string): {
  suite: TestSuite
  test: (name: string, fn: TestFn) => void
} {
  const suite: TestSuite = { name, tests: [] }
  return {
    suite,
    test: (caseName, fn) => {
      suite.tests.push({ name: caseName, fn })
    }
  }
}

export interface RunResult {
  total: number
  passed: number
  failed: number
  failures: Array<{ suite: string; name: string; error: unknown }>
  durationMs: number
}

export async function runSuites(suites: TestSuite[]): Promise<RunResult> {
  const start = Date.now()
  let total = 0
  let passed = 0
  const failures: RunResult['failures'] = []

  for (const suite of suites) {
    console.log(`\n■ ${suite.name}`)
    for (const test of suite.tests) {
      total++
      const t0 = Date.now()
      try {
        await test.fn()
        passed++
        const ms = Date.now() - t0
        console.log(`  ✓ ${test.name} (${ms}ms)`)
      } catch (err) {
        const ms = Date.now() - t0
        console.log(`  ✗ ${test.name} (${ms}ms)`)
        failures.push({ suite: suite.name, name: test.name, error: err })
      }
    }
  }

  const failed = failures.length
  const durationMs = Date.now() - start

  console.log('\n' + '━'.repeat(60))
  console.log(`Total: ${total}   Passed: ${passed}   Failed: ${failed}   (${durationMs}ms)`)
  if (failures.length > 0) {
    console.log('\nFailures:')
    for (const failure of failures) {
      console.log(`  • [${failure.suite}] ${failure.name}`)
      const e = failure.error
      const msg = e instanceof Error ? e.stack || e.message : String(e)
      console.log(
        msg
          .split('\n')
          .map(line => `      ${line}`)
          .join('\n')
      )
    }
  }
  console.log('━'.repeat(60))

  return { total, passed, failed, failures, durationMs }
}
