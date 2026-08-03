#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

function readAppCatalog() {
  const appCatalogPath = path.resolve(__dirname, '../src/apps')
  return fs
    .readdirSync(appCatalogPath)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts')
    .map(file => path.basename(file, '.ts'))
}

function main() {
  const appIds = readAppCatalog()

  console.log('migrate:seed compatibility check')
  console.log('Database app seeding is no longer required in this server package.')
  console.log(
    `Static integrations are loaded from src/apps (${appIds.length} app${appIds.length === 1 ? '' : 's'}): ${appIds.join(', ')}`
  )
}

main()
