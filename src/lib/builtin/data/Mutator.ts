import { firestore } from 'firebase-admin'

import type { CollectionMutator } from '../../util/database/Collection'
import DocumentSnapshot = firestore.DocumentSnapshot
import QuerySnapshot = firestore.QuerySnapshot

export class Mutator {
  /**
   * The **SpecificKeyFieldKVMutator()** method produce {@link CollectionMutator} that mutates collection array to key-value object.
   * @param keyLocator - Key locator function finds the value that will be object key.
   * @return CollectionMutator
   * @constructor
   */
  public static SpecificKeyFieldKVMutator(
    keyLocator: (doc: DocumentSnapshot) => string = (doc) => doc.id
  ): CollectionMutator<QuerySnapshot> {
    return (d: QuerySnapshot) => {
      const kvObj: any = {}
      d.docs.forEach((doc) => {
        kvObj[keyLocator(doc)] = doc.data()
      })
      return kvObj
    }
  }

  /**
   * The **DefaultCollectionKeyValueMutator** field is a default key-value mutator.
   */
  public static DefaultCollectionKeyValueMutator: CollectionMutator<QuerySnapshot> =
    Mutator.SpecificKeyFieldKVMutator()
}
