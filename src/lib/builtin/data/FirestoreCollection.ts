import { firestore } from 'firebase-admin'
import fs from 'fs'
import { hasher } from 'node-object-hash'

import type { DataType } from '../../util/data/DataType'
import type { DataChanges } from '../../util/data/DMapUtil'
import { FieldDelete } from '../../util/data/FieldDelete'
import { Collection } from '../../util/database/Collection'
import { ConsoleColour } from '../../util/debugger/Colour'
import { FirestoreDatabase } from './FirestoreDatabase'
import { Mutators } from './Mutators'
import QuerySnapshot = firestore.QuerySnapshot
import CollectionReference = firestore.CollectionReference
import DocumentData = firestore.DocumentData

/**
 * @category Built-in
 */
export class FirestoreCollection<T extends DataType> extends Collection<
  T,
  QuerySnapshot,
  CollectionReference<DocumentData>
> {
  protected collectionMutator = Mutators.DefaultCollectionKeyValueMutator

  protected initInstance(collectionName: string) {
    return new FirestoreDatabase().getDB().collection(collectionName)
  }

  protected async retrieveCollection(): Promise<FirebaseFirestore.QuerySnapshot> {
    return this.dbInstance.get()
  }

  private chunkArray(arr: DataChanges[], size: number) {
    const myArray = []
    for (let i = 0; i < arr.length; i += size) {
      myArray.push(arr.slice(i, i + size))
    }
    return myArray
  }

  protected async handleChanges(
    changes: DataChanges[]
  ): Promise<DataChanges[]> {
    const changesChunk = this.chunkArray(changes, 500)

    let i = 0
    for (const ca of changesChunk) {
      const batch = this.dbInstance.firestore.batch()

      ca.forEach((v) => {
        let target
        if (!v._docID) {
          // Generate new ID
          target = this.dbInstance.doc()
          v._docID = target.id
        } else {
          target = this.dbInstance.doc(v._docID)
        }

        switch (v.type) {
          case 'create':
            batch.create(target, v.to)
            break
          case 'delete':
            batch.delete(target)
            break
          case 'update': {
            const parsedTo: DataType = {}
            Object.keys(v.to).forEach((k) => {
              const d = v.to[k]

              if (d instanceof FieldDelete) {
                parsedTo[k] = d.resolve('firestore')
                return
              }

              parsedTo[k] = d
            })

            batch.update(target, parsedTo)
          }
        }
      })

      const c = this.debug.loadingInfo(
        `pushing changes to the database (chunk ${i + 1} of ${
          changesChunk.length
        })`
      )

      try {
        await batch.commit()
        c.succeed()
      } catch (e) {
        c.fail()
        return changes
      }
      i += 1
    }

    return changes
  }

  protected async verifyChanges(changes: DataChanges[]): Promise<boolean> {
    const allDocs = await this.dbInstance.firestore.getAll(
      ...changes.map((d) => this.dbInstance.doc(d._docID as string))
    )

    const evalResult = changes.map((v) => {
      const possibleDbDoc = allDocs.filter((d) => d.id === v._docID)
      const dbDoc = possibleDbDoc[0]

      if (!dbDoc) {
        return null
      }

      if (!dbDoc.exists) {
        if (v.type === 'delete') {
          return { id: v._docID, report: [], reference: '--deleted--' }
        }
        return {
          id: v._docID,
          report: [{ present: '--document-not-existed--', expect: v.to }],
          reference: '--document-not-existed--'
        }
      }

      const mismatch: { key: string; present: any; expect: any }[] = []

      Object.keys(v.to).forEach((k) => {
        const refVal = v.to[k]
        const dbD = dbDoc.get(k)

        // Validate deleted field
        if (refVal instanceof FieldDelete) {
          if (!dbD) return
        }
        const refValHash = hasher().hash(refVal)
        const dbDHash = hasher().hash(dbD)
        if (dbDHash !== refValHash) {
          mismatch.push({ key: k, present: dbD, expect: refVal })
        }
      })

      return { id: v._docID, report: mismatch, reference: dbDoc.data() }
    })

    const total = changes.length
    const missing = evalResult.filter((d) => d === null).length
    const passed = evalResult.filter(
      (d) => d !== null && d.report.length === 0
    ).length
    const failed = evalResult.filter((d) => d !== null && d.report.length > 0)

    this.debug.info(`changes verified successfully (total ${total} entities)`)
    this.debug.info(
      `${ConsoleColour.GREEN}passed ${passed}, ${ConsoleColour.RED}failed ${failed.length},${ConsoleColour.RESET} missing ${missing}`
    )

    if (failed.length > 0) {
      this.debug.warn(
        `${failed.length} changes results were found not updated. \nPlease check ${ConsoleColour.BOLD}./review/DEV/.verify_log.json${ConsoleColour.RESET}`
      )
      fs.writeFileSync(
        `review/${process.env.RUNTIME_MODE}/.verify_log.json`,
        JSON.stringify(failed, null, 4)
      )
    }

    return total === passed
  }
}
