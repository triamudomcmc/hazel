import * as fs from 'fs'

import { Debugger } from './debugger/Debugger'

export class Runtime {
  public readonly MODE: 'DEV' | 'PROD'

  private debug = new Debugger('Runtime')

  constructor(MODE: 'DEV' | 'PROD') {
    this.MODE = MODE

    const resDir = fs.existsSync('resource/collection')
    if (!resDir) {
      this.debug.info('created resource folder for data collections.')
      fs.mkdirSync('resource/collection', { recursive: true })
    }

    process.env.RUNTIME_MODE = MODE
  }

  public runSnippet(snippet: (debug: Debugger) => Promise<void> | void) {
    if (this.MODE === 'PROD') {
      this.debug.warn('running the snippet in PROD mode')
    }
    snippet(this.debug)
  }
}
