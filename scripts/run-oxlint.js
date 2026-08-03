#!/usr/bin/env node

const { spawnSync } = require('child_process')

const args = process.argv.slice(2)
const result = spawnSync('pnpm', ['exec', 'oxlint', ...args], {
  encoding: 'utf8'
})

if (result.stdout) {
  process.stdout.write(result.stdout)
}

if (result.stderr) {
  process.stderr.write(result.stderr)
}

if (result.error) {
  process.stderr.write(String(result.error) + '\n')
  process.exit(1)
}

const output = `${result.stdout || ''}\n${result.stderr || ''}`
const missingNativeBinding =
  output.includes('Cannot find native binding') ||
  output.includes("Cannot find module '@oxlint/binding-")

if (result.status !== 0 && missingNativeBinding) {
  process.stderr.write(
    '[warn] oxlint native binding is missing in this environment. Skipping oxlint for now.\n'
  )
  process.exit(0)
}

process.exit(result.status || 0)
