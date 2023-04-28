import * as dotenv from 'dotenv'
import admin, { firestore } from 'firebase-admin'

import { Database } from '../../util/database/Database'
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
            projectId: process.env.FCERT_PROJECT_ID,
            clientEmail: process.env.FCERT_CLIENT_EMAIL,
            privateKey: process.env.FCERT_PRIVATE_KEY?.replace(/\\n/gm, '\n')
          })
        })
        .firestore()
    } catch (e) {
      return admin.firestore()
    }
  }

  protected isProdDB(): boolean {
    return this.projectID === 'clubreg-fa68a'
  }
}
