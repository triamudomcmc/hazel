import * as fs from 'fs'
import path from 'path'
import * as process from 'process'
// eslint-disable-next-line node/no-unpublished-import
import * as ts from 'typescript'

import { ConsoleColour, VERSION } from '../../lib'
import { parseHeader } from './header'

export const runScript = (fpath: string, options: any) => {
  // load file
  let data: Buffer
  try {
    data = fs.readFileSync(fpath)
  } catch (_) {
    console.log(
      `${'\u001b[31m'}Unable to open script file ${ConsoleColour.BOLD}${fpath}${
        ConsoleColour.RESET
      }`
    )
    return
  }

  const script = data.toString()

  console.log('Transpiling source code..')

  const property = parseHeader(script)

  if (!property) {
    console.log(
      `${'\u001b[31m'}Unable to transpile source code (maybe file header is invalid)`
    )
    return
  }

  // prepare runtime
  if (property.version !== 'any' && !options.force) {
    if (property.version !== VERSION) {
      console.log(
        `${'\u001b[31m'}Error: This script requires hazel runtime version ${
          property.version
        }. (current ${VERSION})\nHint: try applying -f, --force flag to force the script to run.`
      )
      return
    }
  }

  if (options.force) {
    console.log(
      `${ConsoleColour.YELLOW}Warning: forcing version exclusive script to run on incompatible runtime might cause a destructive error.`
    )
  }

  if (property.env_file) {
    process.env.CUSTOM_ENV_PATH = property.env_file
  }

  if (property.skip_yes_no) {
    process.env.SKIP_YESNO = 'yes'
  }

  let cleaned = script.replace(new RegExp('hazel.', 'g'), '')
  cleaned = cleaned.replace(/^.*import.*$/gm, '')
  if (!process.argv[0]) {
    return
  }

  /* TODO Virtual environment
   * Allow cli to run script with version specified
   */
  const nodeExe = process.argv[0]
  const modulePath = path.resolve(
    nodeExe,
    '../..',
    'lib/node_modules/@tucmc/hazel'
  )
  const libPath = path.join(modulePath, 'dist/lib/index')

  const importHeading = `
  Object.assign(global, require('${libPath}'))
  `

  const cleanedJs = ts.transpile(cleaned)

  eval(importHeading + cleanedJs)
}
