import { firestore } from 'firebase-admin'

import type { DataType } from '../../util/data/DataType'
import { Collection } from '../../util/database/Collection'
import { Database } from '../../util/database/Database'
import { Mutator } from './Mutator'
import QuerySnapshot = firestore.QuerySnapshot

export class FirestoreCollection<T extends DataType> extends Collection<
  T,
  QuerySnapshot
> {
  protected collectionMutator = Mutator.DefaultCollectionKeyValueMutator

  protected async retrieveCollection(
    collectionName: string
  ): Promise<FirebaseFirestore.QuerySnapshot> {
    return new Database().getDB().collection(collectionName).get()
  }
}
