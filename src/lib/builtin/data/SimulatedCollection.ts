import * as crypto from 'crypto'
import fs from 'fs'
import { hasher } from 'node-object-hash'
import * as process from 'process'

import type { DataType } from '../../util/data/DataType'
import { DMap } from '../../util/data/DMap'
import type { DataChanges } from '../../util/data/DMapUtil'
import { FieldDelete } from '../../util/data/FieldDelete'
import { LiveDMap } from '../../util/data/LiveDMap'
import { ReferableMapEntity } from '../../util/data/ReferableEntity'
import { Collection } from '../../util/database/Collection'
import { ConsoleColour } from '../../util/debugger/Colour'
import { Files } from '../../util/io/Files'
import type { SimulatedDataPreset } from './SimulatedDataPresets'

/**
 * The **SimulatedCollection<T>()** class extends from {@link Collection}. It shares similar properties except the data is simulated locally.
 * @extends Collection
 * @category Built-in
 */
export class SimulatedCollection<T extends DataType> extends Collection<
  T,
  null,
  null
> {
  private readonly simulatedContent: DMap<string, T[keyof T]>

  constructor(
    name: string,
    preset: SimulatedDataPreset<T>,
    instructor?: (simulated: DMap<string, T[keyof T]>) => void
  ) {
    super(name)

    const MODE = process.env.RUNTIME_MODE

    if (MODE === 'PROD') {
      throw Error(
        `${ConsoleColour.RED}Simulated collection must not be used on PRODUCTION runtime.${ConsoleColour.RESET}`
      )
    }

    const buildCache = this.loadBuildCache()

    if (buildCache) {
      this.simulatedContent = new DMap(buildCache.content)
      return
    }

    this.simulatedContent = new DMap<string, T[keyof T]>(preset)
    instructor && instructor(this.simulatedContent)
    this.saveBuildCache()
  }

  protected async handleChanges(
    changes: DataChanges[]
  ): Promise<DataChanges[]> {
    const object = new DMap(this.simulatedContent.getRecord())
    changes.forEach((v) => {
      if (!v._docID) {
        v._docID = `simulated-${crypto.randomUUID()}`
      }

      switch (v.type) {
        case 'create':
          object.set(v._docID, <T[keyof T]>v.to)
          break
        case 'delete':
          object.remove(v._docID)
          break
        case 'update': {
          const parsedTo: DataType = {}
          const original = object.get(v._docID)

          if (!original) break

          Object.keys(v.to).forEach((k) => {
            const d = v.to[k]

            if (d instanceof FieldDelete) {
              delete original[k]
              return
            }

            parsedTo[k] = d
          })

          object.set(v._docID, { ...original, ...parsedTo })
        }
      }
    })

    this.debug.info(
      `${ConsoleColour.BGYELLOW}pushing changes to the database...`
    )
    Files.writeFile(
      object.getRecord(),
      `resource/collection/simulated/${this.name}`
    )

    return changes
  }

  protected initInstance(collectionName: string): null {
    return null
  }

  protected retrieveCollection(): Promise<null> {
    return Promise.resolve(null)
  }

  protected collectionMutator = (d: any) => d as DataType

  protected async verifyChanges(changes: DataChanges[]): Promise<boolean> {
    const data = this.loadBuildCache()

    if (!data) {
      return false
    }

    const allDocs = new DMap(data.content).map((k, v) => {
      return {
        id: k,
        ...v
      }
    })

    const evalResult = changes.map((v) => {
      const possibleDbDoc = allDocs.filter((d) => d.id === v._docID)
      const dbDoc = possibleDbDoc[0]

      if (!dbDoc) {
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
        const dbD = dbDoc[k]

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

      return { id: v._docID, report: mismatch, reference: dbDoc }
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

  private loadBuildCache() {
    return Files.readFile(`resource/collection/simulated/${this.name}`)
  }

  private saveBuildCache() {
    Files.writeFile(
      this.simulatedContent.getRecord(),
      `resource/collection/simulated/${this.name}`
    )
  }

  private buildRef(): LiveDMap<string, ReferableMapEntity<T[keyof T]>> {
    const refMap = this.simulatedContent
    const nMap: LiveDMap<string, ReferableMapEntity<T[keyof T]>> = new LiveDMap<
      string,
      any
    >({})

    refMap.iterateSync((k, v) => {
      const id = k
      nMap.set(id, new ReferableMapEntity<T[keyof T]>(v, id))
    })

    return nMap
  }

  /**
   * @deprecated This method should not be used since Simulated Collections are built and saved locally. The method **fetch()** would be more versatile in this case.
   */
  async readFromCache(
    autoFetch = false
  ): Promise<DMap<string, ReferableMapEntity<T[keyof T]>> | null> {
    return this.fetch()
  }

  async fetch(): Promise<DMap<string, ReferableMapEntity<T[keyof T]>>> {
    const loader = this.debug.loadingInfo('fetching collection from database.')

    loader.succeed()
    return this.buildRef()
  }
}
