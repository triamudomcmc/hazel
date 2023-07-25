import { firestore } from 'firebase-admin'
import FieldValue = firestore.FieldValue

/**
 * @category Lib
 */
export class FieldDelete {
  public resolve(dbType: 'firestore') {
    switch (dbType) {
      case 'firestore':
        return FieldValue.delete()
    }
  }
}
