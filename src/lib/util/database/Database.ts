import * as dotenv from 'dotenv'
import admin, { firestore } from 'firebase-admin'

import { ConsoleColour } from '../debugger/Colour'
import { Debugger } from '../debugger/Debugger'
import Firestore = firestore.Firestore

dotenv.config()

export class Database {
  private db: Firestore

  private projectID = process.env.FCERT_PROJECT_ID

  private debug = new Debugger('DBUnit')

  constructor() {
    try {
      this.db = admin
        .initializeApp({
          credential: admin.credential.cert({
            projectId: this.projectID,
            clientEmail: process.env.FCERT_CLIENT_EMAIL,
            privateKey: process.env.FCERT_PRIVATE_KEY
          })
        })
        .firestore()
    } catch (e) {
      this.debug.err('unable to initialise database.')
      throw e
    }
  }

  private isProdDB() {
    return this.projectID === 'clubreg-fa68a'
  }

  public getDB(): Firestore {
    if (this.isProdDB()) {
      if (process.env.RUNTIME_MODE !== 'PROD') {
        throw Error(
          `${ConsoleColour.RED} Accessing production database in DEV mode is prohibited.\n${ConsoleColour.RESET}${ConsoleColour.BGYELLOW}Please change your runtime mode to ${ConsoleColour.BOLD}PROD${ConsoleColour.RESET}${ConsoleColour.BGYELLOW} in order to connect to the production database.\n${ConsoleColour.RESET}`
        )
      }
      this.debug.warn(
        'accessing production database. Please check your snippet carefully in case of unintended changes.'
      )
      const con = this.debug.pauseForYNQuestion()
      if (!con) {
        throw Error(
          `${ConsoleColour.RED} user terminated the snippet.${ConsoleColour.RESET}`
        )
      }
      this.debug.info(
        'action authorised. Note: The snippet might manipulate the production database.'
      )
    }
    return this.db
  }
}
