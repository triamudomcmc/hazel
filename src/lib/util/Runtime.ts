import * as fs from 'fs'

import { Debugger } from './debugger/Debugger'

/**
 * The **Runtime()** class setup and regulate the necessary environment configurations.
 * @category Lib
 */
export class Runtime {
  public readonly MODE: 'DEV' | 'PROD'

  private debug = new Debugger('Runtime')

  /**
   * The **Runtime()** class setup and regulate the necessary environment configurations.
   * @param MODE - Runtime mode **DEV** for development or **PROD** for production.
   */
  constructor(MODE: 'DEV' | 'PROD') {
    this.MODE = MODE

    const resDir = fs.existsSync('resource/collection')
    if (!resDir) {
      this.debug.info('created resource folder for data collections.')
      fs.mkdirSync('resource/collection', { recursive: true })
    }

    process.env.RUNTIME_MODE = MODE
  }

  /**
   * The **runSnippet()** method run the provided snippet under the runtime's environment.
   * @param snippet - A snippet function that will be executed in the runtime.
   */
  public runSnippet(snippet: (debug: Debugger) => Promise<void> | void) {
    if (this.MODE === 'PROD') {
      this.debug.warn('running the snippet in PROD mode')
    }
    snippet(this.debug)
  }
}
