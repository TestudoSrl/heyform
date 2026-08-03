#!/usr/bin/env node

const { existsSync } = require('fs')
const { spawnSync } = require('child_process')
const { join } = require('path')

const candidates = [
  join(__dirname, '..', 'dist', 'main.js'),
  join(__dirname, '..', 'dist', 'src', 'main.js'),
  join(__dirname, '..', 'dist', 'packages', 'server', 'main.js')
]

const entry = candidates.find(file => existsSync(file))

if (!entry) {
  process.stderr.write('Unable to locate the built server entrypoint in dist/.\n')
  process.exit(1)
}

const result = spawnSync(process.execPath, ['--enable-source-maps', entry], {
  stdio: 'inherit'
})

if (result.error) {
  process.stderr.write(String(result.error) + '\n')
  process.exit(1)
}

process.exit(result.status === null ? 0 : result.status)
