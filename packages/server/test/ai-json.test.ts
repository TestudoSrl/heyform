import * as assert from 'assert'

import { parseAIJson } from '../src/utils/ai-json'

function testParsesValidJson() {
  assert.deepStrictEqual(parseAIJson('{"name":"Lead form"}'), {
    name: 'Lead form'
  })
}

function testRepairsCommonAIJsonProblems() {
  assert.deepStrictEqual(parseAIJson("```json\n{name: 'Lead form', fields: [],}\n```"), {
    name: 'Lead form',
    fields: []
  })
}

function run() {
  testParsesValidJson()
  testRepairsCommonAIJsonProblems()
}

if (require.main === module) {
  try {
    run()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exitCode = 1
  }
}
