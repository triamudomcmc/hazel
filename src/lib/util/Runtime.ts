import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as process from 'process'

import { Debugger } from './debugger/Debugger'
/**
 * The **Runtime()** class setup and regulate the necessary environment configurations.<br/>
 * Some **process environment** can be set in order to update runtime options.<br/>
 * <pre>.RUNTIME_MODE = 'DEV' | 'PROD' // Runtime mode<br/>
 * .CUSTOM_ENV_PATH = '/path/to/.env' // Custom .env path<br/>
 * .SKIP_YES_NO = 'yes' | 'no' // Skip every question</pre>
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

    const resDir = fs.existsSync(`resource/collection/${this.MODE}`)
    if (!resDir) {
      this.debug.info('created resource folder for data collections.')
      fs.mkdirSync(`resource/collection/${this.MODE}`, { recursive: true })
    }

    const simDir = fs.existsSync('resource/collection/simulated')
    if (!simDir) {
      this.debug.info('created simulated folder for simulated collections.')
      fs.mkdirSync('resource/collection/simulated', { recursive: true })
    }

    const revDir = fs.existsSync(`review/${this.MODE}`)
    if (!revDir) {
      this.debug.info('created review folder for data collections.')
      fs.mkdirSync(`review/${this.MODE}`, { recursive: true })
    }

    process.env.RUNTIME_MODE = MODE

    const envPath = process.env.CUSTOM_ENV_PATH
    dotenv.config({ path: envPath })
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
