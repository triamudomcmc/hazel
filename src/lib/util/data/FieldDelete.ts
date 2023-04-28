import { firestore } from 'firebase-admin'
import FieldValue = firestore.FieldValue

export class FieldDelete {
  public resolve(dbType: 'firestore') {
    switch (dbType) {
      case 'firestore':
        return FieldValue.delete()
    }
  }
}
