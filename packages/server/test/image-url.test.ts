import * as assert from 'assert'

type DtoModule = typeof import('../src/common/dto')

async function withImageUrlEnvironment<T>(
  callback: (dto: DtoModule) => T | Promise<T>
): Promise<T> {
  const previousNodeEnv = process.env.NODE_ENV
  const previousHomepageUrl = process.env.APP_HOMEPAGE_URL
  const previousS3PublicUrl = process.env.S3_PUBLIC_URL

  process.env.NODE_ENV = 'production'
  process.env.APP_HOMEPAGE_URL = 'http://192.168.112.4:9157'
  delete process.env.S3_PUBLIC_URL

  delete require.cache[require.resolve('../src/environments')]
  delete require.cache[require.resolve('../src/common/dto')]

  try {
    return await callback(require('../src/common/dto') as DtoModule)
  } finally {
    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV
    } else {
      process.env.NODE_ENV = previousNodeEnv
    }

    if (previousHomepageUrl === undefined) {
      delete process.env.APP_HOMEPAGE_URL
    } else {
      process.env.APP_HOMEPAGE_URL = previousHomepageUrl
    }

    if (previousS3PublicUrl === undefined) {
      delete process.env.S3_PUBLIC_URL
    } else {
      process.env.S3_PUBLIC_URL = previousS3PublicUrl
    }

    delete require.cache[require.resolve('../src/environments')]
    delete require.cache[require.resolve('../src/common/dto')]
  }
}

async function testFirstPartyPrivateImageUrlPolicy() {
  await withImageUrlEnvironment(dto => {
    assert.strictEqual(dto.isAllowedImageUrl('http://192.168.112.4:9157/static/webhook.png'), true)
    assert.strictEqual(dto.isAllowedImageUrl('http://192.168.112.4:9158/static/webhook.png'), false)
    assert.strictEqual(dto.isAllowedImageUrl('http://192.168.112.5:9157/static/webhook.png'), false)
    assert.strictEqual(dto.isAllowedImageUrl('https://images.unsplash.com/photo.jpg'), true)
  })
}

async function run() {
  await testFirstPartyPrivateImageUrlPolicy()
}

if (require.main === module) {
  run().catch(error => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exitCode = 1
  })
}
