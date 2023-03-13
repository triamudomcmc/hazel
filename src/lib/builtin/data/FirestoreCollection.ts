import { firestore } from 'firebase-admin'

import type { DataType } from '../../util/data/DataType'
import { Collection } from '../../util/database/Collection'
import { FirestoreDatabase } from './FirestoreDatabase'
import { Mutators } from './Mutators'
import QuerySnapshot = firestore.QuerySnapshot

/**
 * @category Built-in
 */
export class FirestoreCollection<T extends DataType> extends Collection<
  T,
  QuerySnapshot
> {
  protected collectionMutator = Mutators.DefaultCollectionKeyValueMutator

  protected async retrieveCollection(
    collectionName: string
  ): Promise<FirebaseFirestore.QuerySnapshot> {
    return new FirestoreDatabase().getDB().collection(collectionName).get()
  }
}
