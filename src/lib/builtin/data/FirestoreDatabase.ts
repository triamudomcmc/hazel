import { Database } from '@lib'
import * as dotenv from 'dotenv'
import admin, { firestore } from 'firebase-admin'
import Firestore = firestore.Firestore

dotenv.config()

/**
 * @category Built-in
 */
export class FirestoreDatabase extends Database<Firestore> {
  private projectID = process.env.FCERT_PROJECT_ID

  protected initDB(): FirebaseFirestore.Firestore {
    try {
      return admin
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

  protected isProdDB(): boolean {
    return this.projectID === 'clubreg-fa68a'
  }
}
