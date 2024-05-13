import * as fs from 'fs'
import path from 'path'
import process from 'process'
import rsync from 'readline-sync'

import { ConsoleColour, VERSION } from '../../lib'

const askFileName = (): string => {
  const result = rsync.question('Script name: ')
  if (!result) {
    return askFileName()
  }
  return result
}

const DEFAULT_HEADER = `/*------Hazel Typescript Header-------
--------------PROPERTIES--------------
env_file = ""
skip_yes_no = false
version = "any"
------------END-PROPERTIES------------
Do not remove the heading otherwise
the transpiler will not transpile the script.
-------------Header END--------------*/`

const EXAMPLE = `new hazel.Runtime("DEV").runSnippet(async (debug) => {
  // Add your script here
  
  
})`
export const initScript = (options: any) => {
  let filename = options.name
  if (!filename) {
    filename = askFileName()
  }

  if (filename.includes('.')) {
    console.log(
      `${ConsoleColour.RED}Error script filename. (Script name must not contain special characters.)\nHint: script name should only contain alphanumeric letter or hyphen, for example my-script2.`
    )
    return
  }

  if (fs.existsSync(`${filename}.ts`)) {
    console.log(
      `${ConsoleColour.RED}Unable to create script ${filename}. File is already existed.\nHint: try creating new script with different name.`
    )
    return
  }

  let header = DEFAULT_HEADER
  if (options.version) {
    header = header.replace('version = "any"', `version = "=${VERSION}"`)
  }

  const nodeExe = process.argv[0]
  if (!nodeExe) throw 'Error: can not find hazel module'

  const modulePath = path.resolve(
    nodeExe,
    '../..',
    'lib/node_modules/@tucmc/hazel'
  )
  const libPath = path.join(modulePath, 'src/lib/index')

  const importText = `import * as hazel from "${libPath}"`
  fs.writeFileSync(`${filename}.ts`, `${header}\n\n${importText}\n\n${EXAMPLE}`)

  console.log(
    `${ConsoleColour.GREEN}Script ${ConsoleColour.BOLD}${filename}.ts${ConsoleColour.RESET}${ConsoleColour.GREEN} created successfully!${ConsoleColour.RESET}\nLet's edit the snippet file. For further documentation visit https://github.com/triamudomcmc/hazel`
  )
}
