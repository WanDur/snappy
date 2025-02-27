#!/usr/bin/env node

/**
 * This script is used to generate the code in assets.
 * So everytime new assets are imported, we don't need to import it by ourselves
 */

const fs = require('fs')
const path = require('path')

const assetesDir = path.join(process.cwd(), 'assets')
const outputPath = path.join(assetesDir, 'index.ts')

const getFiles = (dir) => {
  const files = fs.readdirSync(dir)
  const fileList = {}

  files.forEach((file) => {
    if (file == 'index.ts') {
      return
    }
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      fileList[file] = getFiles(filePath)
    } else {
      const relativePath = path.relative(assetesDir, filePath).replace('//g', '/').replace(/\\/g, '/')
      const fileName = path.parse(file).name
      fileList[fileName] = `require('./${relativePath}')`
    }
  })

  return fileList
}

const assets = getFiles(assetesDir)

const tsContent = `/**
 * THIS FILE IS AUTO GENERATED from (scripts/register-assets.js)
 * If new assets are added, run "npm run register-assets" in your terminal
 */
const assets = ${JSON.stringify(assets, null, 2).replace(/"require\(([^)]+)\)"/g, 'require($1)')}

/**
 * use this function to get all assets registered to the app
 * 
 * @example source={getAssetes('images').logo512}
 */
export const getAssets = <T extends keyof typeof assets>(assetType: T) => {
    return assets[assetType]
}
`

fs.writeFileSync(outputPath, tsContent, 'utf8')
const assetsCount = Object.values(assets).reduce((acc, assetType) => acc + Object.keys(assetType).length, 0)
console.log(`${assetsCount} assets registered successfully.`)
