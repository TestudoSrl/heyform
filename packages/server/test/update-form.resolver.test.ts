import * as assert from 'assert'

import { UpdateFormResolver } from '../src/resolver/form/update-form.resolver'

function createResolver() {
  let updates: Record<string, any> | undefined
  let translateQueueArgs: Array<{ formId: string; languages: string[] }> = []

  const formService = {
    update: async (_formId: string, payload: Record<string, any>) => {
      updates = payload
      return true
    },
    addTranslateQueue: (formId: string, languages: string[]) => {
      translateQueueArgs.push({ formId, languages })
    }
  }
  const resolver = new UpdateFormResolver(formService as any)

  return {
    resolver,
    getUpdates: () => updates,
    getTranslateQueueArgs: () => translateQueueArgs
  }
}

async function testPersistsEmptyLanguagesArray() {
  const { resolver, getUpdates, getTranslateQueueArgs } = createResolver()

  await resolver.updateForm(
    {
      settings: {
        languages: ['fr', 'ja']
      }
    } as any,
    {
      formId: 'form_1',
      languages: []
    } as any
  )

  assert.deepStrictEqual(getUpdates()?.['settings.languages'], [])
  assert.strictEqual(getTranslateQueueArgs().length, 0)
}

async function testOmitsLanguagesWhenInputIsNotArray() {
  const { resolver, getUpdates } = createResolver()

  await resolver.updateForm(
    {
      settings: {
        languages: ['fr']
      }
    } as any,
    {
      formId: 'form_2'
    } as any
  )

  assert.strictEqual(
    Object.prototype.hasOwnProperty.call(getUpdates() || {}, 'settings.languages'),
    false
  )
}

async function testNullLanguagesResetsToEmptyArray() {
  const { resolver, getUpdates } = createResolver()

  await resolver.updateForm(
    {
      settings: {
        languages: ['fr']
      }
    } as any,
    {
      formId: 'form_3',
      languages: null
    } as any
  )

  assert.deepStrictEqual(getUpdates()?.['settings.languages'], [])
}

async function testAllowArchiveFalseOnlyUpdatesSettings() {
  const { resolver, getUpdates } = createResolver()

  await resolver.updateForm(
    {
      settings: {
        allowArchive: true
      }
    } as any,
    {
      formId: 'form_4',
      name: 'Renamed Form',
      allowArchive: false
    } as any
  )

  assert.strictEqual(getUpdates()?.name, 'Renamed Form')
  assert.strictEqual(getUpdates()?.['settings.allowArchive'], false)
}

async function run() {
  await testPersistsEmptyLanguagesArray()
  await testOmitsLanguagesWhenInputIsNotArray()
  await testNullLanguagesResetsToEmptyArray()
  await testAllowArchiveFalseOnlyUpdatesSettings()
}

if (require.main === module) {
  run().catch(error => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exitCode = 1
  })
}
