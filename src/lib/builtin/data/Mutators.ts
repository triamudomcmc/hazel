import { firestore } from 'firebase-admin'

import type { CollectionMutator } from '../../util/database/Collection'
import DocumentSnapshot = firestore.DocumentSnapshot
import QuerySnapshot = firestore.QuerySnapshot
import type { DMap } from '../../util/data/DMap'
import type { IUserData } from '../types/UserData'

/**
 * @category Built-in
 */
export class Mutators {
  /**
   * The **SpecificKeyFieldKVMutator()** method produce {@link CollectionMutator} that mutates collection array to the key-value object.
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
        kvObj[keyLocator(doc)] = { _docID: doc.id, ...doc.data() }
      })
      return kvObj
    }
  }

  public static SimulatedUserMutator(
    keyLocator: (data: IUserData) => string = (data) => data.student_id
  ): CollectionMutator<DMap<string, IUserData>> {
    return (d: DMap<string, IUserData>) => {
      const kvObj: any = {}
      d.iterateSync((k, v) => {
        kvObj[keyLocator(v)] = { _docID: k, ...v }
      })

      return kvObj
    }
  }

  /**
   * The **DefaultCollectionKeyValueMutator** field is a default key-value mutator.
   */
  public static DefaultCollectionKeyValueMutator: CollectionMutator<QuerySnapshot> =
    Mutators.SpecificKeyFieldKVMutator()
}
