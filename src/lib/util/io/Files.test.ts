import { describe, expect, test } from '@jest/globals'
import fs from 'fs'

import { Files } from './Files'

describe('IO', () => {
  const sample = { dataSample: "testsjtesh,kjrhsa,lekrj;;;''" }

  test('writeFile', () => {
    const filePath = './.test/sampleFile'
    Files.writeFile(sample, filePath)

    const file = fs.readFileSync('./.test/sampleFile')
    const repli = file.toString('utf8')
    const exportedObj = JSON.parse(repli)

    /*
     * Exported file from Files IO must be in this format.
     * {
     *    "exported": <TIMESTAMP_MILLI>,
     *    "content":{...}
     * }
     * */

    expect(exportedObj).toHaveProperty('exported')
    expect(exportedObj).toHaveProperty('content')
    expect(exportedObj.content.dataSample).toBe(sample.dataSample)
  })

  test('readFile', () => {
    const filePath = './.test/readFileTest'
    const result = Files.readFile(filePath)

    expect(result?.exported).toBe(1708689342452)
    expect(result?.content?.sample).toBe('ab127*___@#Dกก')
  })
})
