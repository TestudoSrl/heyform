import { FieldKindEnum } from '@heyform-inc/shared-types-enums'
import * as assert from 'assert'

import { CollaborativeSessionService } from '../src/service/collaborative-session.service'

async function testUpdatesOnlyPublishedFormFields() {
  let capturedFilter: Record<string, any> | undefined
  let capturedUpdate: Record<string, any> | undefined

  const model = {
    findOneAndUpdate: async (filter: Record<string, any>, update: Record<string, any>) => {
      capturedFilter = filter
      capturedUpdate = update
      return {
        id: 'shared_token',
        formId: 'form_1',
        values: { question_1: 'New answer' },
        revision: 2,
        completedAt: 0
      }
    }
  }
  const service = new CollaborativeSessionService(model as any)

  await service.update(
    'shared_token',
    {
      id: 'form_1',
      fields: [
        { id: 'question_1', kind: FieldKindEnum.SHORT_TEXT },
        { id: 'question_2', kind: FieldKindEnum.LONG_TEXT }
      ]
    } as any,
    {
      question_1: 'New answer',
      question_2: null,
      forged_field: 'Ignored'
    }
  )

  assert.strictEqual(capturedFilter?._id, 'shared_token')
  assert.strictEqual(capturedFilter?.formId, 'form_1')
  assert.strictEqual(capturedFilter?.completedAt, 0)
  assert.deepStrictEqual(capturedUpdate?.$set, {
    'values.question_1': 'New answer'
  })
  assert.deepStrictEqual(capturedUpdate?.$unset, {
    'values.question_2': 1
  })
  assert.deepStrictEqual(capturedUpdate?.$inc, { revision: 1 })
}

async function testClaimsOneExactRevision() {
  let capturedFilter: Record<string, any> | undefined

  const model = {
    findOneAndUpdate: async (filter: Record<string, any>) => {
      capturedFilter = filter
      return { id: 'shared_token' }
    }
  }
  const service = new CollaborativeSessionService(model as any)

  await service.claim('shared_token', 'form_1', 7)

  assert.strictEqual(capturedFilter?._id, 'shared_token')
  assert.strictEqual(capturedFilter?.formId, 'form_1')
  assert.strictEqual(capturedFilter?.revision, 7)
  assert.strictEqual(capturedFilter?.completedAt, 0)
}

async function testTracksAnonymousParticipantPresence() {
  let capturedFilter: Record<string, any> | undefined
  let capturedUpdate: Record<string, any> | undefined

  const model = {
    findOneAndUpdate: async (filter: Record<string, any>, update: Record<string, any>) => {
      capturedFilter = filter
      capturedUpdate = update
      return { id: 'shared_token' }
    }
  }
  const service = new CollaborativeSessionService(model as any)

  await service.touch('shared_token', 'anonymous_browser_id')

  const participantEntries = Object.entries(capturedUpdate?.$set || {})

  assert.strictEqual(capturedFilter?._id, 'shared_token')
  assert.ok(capturedFilter?.expiresAt?.$gt instanceof Date)
  assert.strictEqual(participantEntries.length, 1)
  assert.match(participantEntries[0][0], /^participants\.[a-f0-9]{64}$/)
  assert.strictEqual(typeof participantEntries[0][1], 'number')
}

function testCountsOnlyRecentlyActiveParticipants() {
  const service = new CollaborativeSessionService({} as any)
  const currentTimestamp = 1_000

  const count = service.activeParticipantCount(
    {
      participants: {
        active: currentTimestamp,
        boundary: currentTimestamp - 10,
        inactive: currentTimestamp - 11
      }
    } as any,
    currentTimestamp
  )

  assert.strictEqual(count, 2)
}

async function run() {
  await testUpdatesOnlyPublishedFormFields()
  await testClaimsOneExactRevision()
  await testTracksAnonymousParticipantPresence()
  testCountsOnlyRecentlyActiveParticipants()
}

if (require.main === module) {
  run().catch(error => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exitCode = 1
  })
}
