import * as process from 'process'

import { ConsoleColour } from '../debugger/Colour'
import { Debugger } from '../debugger/Debugger'

/**
 * @template T - A certain database type definition.
 * @group Abstracts
 */
export abstract class Database<T> {
  private readonly db: T

  protected debug = new Debugger(this.constructor.name || 'DBUnit')

  constructor() {
    this.db = this.initDB()
  }

  /**
   * The **initDB()** abstract method will be called in the class constructor to initialise the database.
   * This returns the database specified by generic **T**.
   * @protected
   * @override
   * @abstract
   */
  protected abstract initDB(): T

  /**
   * The **isProdDB()** abstract method checks the connection whether it is a production or not.
   * @protected
   */
  protected abstract isProdDB(): boolean

  /**
   * The **getDB()** method returns database instance and prevents user from accidentally access the production database.
   */
  public getDB(): T {
    if (this.isProdDB()) {
      if (process.env.RUNTIME_MODE !== 'PROD') {
        throw Error(
          `${ConsoleColour.RED} Accessing production database in DEV mode is prohibited.\n${ConsoleColour.RESET}${ConsoleColour.BGYELLOW}Please change your runtime mode to ${ConsoleColour.BOLD}PROD${ConsoleColour.RESET}${ConsoleColour.BGYELLOW} in order to connect to the production database.\n${ConsoleColour.RESET}`
        )
      }
      this.debug.warn(
        'accessing production database. Please check your snippet carefully in case of unintended changes.'
      )

      if (process.env.SKIP_YESNO !== 'yes') {
        const con = this.debug.pauseForYNQuestion()
        if (!con) {
          throw Error(
            `${ConsoleColour.RED} user terminated the snippet.${ConsoleColour.RESET}`
          )
        }
      }

      this.debug.info(
        'action authorised. Note: The snippet might manipulate the production database.'
      )
    }
    return this.db
  }
}
