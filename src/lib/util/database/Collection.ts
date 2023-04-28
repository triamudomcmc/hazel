import path from 'path'
import * as process from 'process'

import type { DataType } from '../data/DataType'
import { DMap } from '../data/DMap'
import type { ChangeList, DataChanges } from '../data/DMapUtil'
import { LiveDMap } from '../data/LiveDMap'
import { ReferableMapEntity } from '../data/ReferableEntity'
import { ConsoleColour } from '../debugger/Colour'
import { Debugger } from '../debugger/Debugger'
import { Files } from '../io/Files'

/**
 * @template T - A received collection type definition
 * @category Lib
 */
export type CollectionMutator<T> = (d: T) => DataType

/**
 * @template T - A collection data type definition.
 * @template M - A {@link CollectionMutator} received collection type definition.
 * @group Abstracts
 */
export abstract class Collection<T extends DataType, M = any, C = any> {
  private readonly name: string

  protected debug = new Debugger(this.constructor.name || 'Collection')

  protected abstract collectionMutator: CollectionMutator<M>

  private rootPath = `resource/collection/${process.env.RUNTIME_MODE}`

  private readonly resourcePath: string

  protected readonly dbInstance: C

  /**
   * The **Collection<T>()** class hold data resources. User can choose either fetch from database or cache.
   * @template T - A collection data type definition.
   * @template M - A {@link CollectionMutator} received collection type definition.
   * @param name - The collection name.
   */
  constructor(name: string) {
    this.name = name
    this.resourcePath = path.join(this.rootPath, `${this.name}.json`)
    this.dbInstance = this.initInstance(name)
  }

  protected abstract initInstance(collectionName: string): C
  /**
   * The **retrieveCollection()** abstract method will be called internally to fetch collection data.
   * Note: Different databases require different procedure to access its collection.
   * @param collectionName - This will be the same as `this.name`.
   * @protected
   * @override
   * @abstract
   */
  protected abstract retrieveCollection(): Promise<M>

  protected abstract handleChanges(
    changes: DataChanges[]
  ): Promise<DataChanges[]>

  protected abstract verifyChanges(changes: DataChanges[]): Promise<boolean>

  /**
   * The **setDefaultMutator()** method set Collection's defaultMutator, which will be used when resource are being fetched automatically.
   * @param mutator - Mutators mutates raw collection data from the database to certain format check {@link Mutator} for some built-in mutators.
   */
  public setDefaultMutator(mutator: CollectionMutator<M>) {
    this.collectionMutator = mutator
    return this
  }

  public async pushChanges(changes: ChangeList, strict = true) {
    if (!changes.isLive && strict) {
      throw Error(
        `${ConsoleColour.BGRED}${ConsoleColour.BOLD}only changes from LiveDMap are pushable by default.${ConsoleColour.RESET} \n${ConsoleColour.BGYELLOW}Please do not push cached data to the database.${ConsoleColour.RESET}`
      )
    }

    return await this.verifyChanges(await this.handleChanges(changes.changes))
  }

  private makeReferableEntities<G extends DataType>(
    data: DataType
  ): Record<string, ReferableMapEntity<G>> {
    const refMap = new DMap<string, G>(data)
    const nMap: Record<string, ReferableMapEntity<G>> = {} as Record<
      string,
      ReferableMapEntity<G>
    >
    refMap.iterateSync((k, v) => {
      const id = v._docID
      delete v._docID
      nMap[k] = new ReferableMapEntity<G>(v, id)
    })

    return nMap
  }

  /**
   * The **fetch()** method fetch the collection from database, mutate, and then save it as a cache.
   * @param [mutator] - Mutators mutates raw collection data from the database to certain format check {@link Mutator} for some built-in mutators.
   * @return Promise<T>
   */
  public async fetch(
    mutator: CollectionMutator<M> = this.collectionMutator
  ): Promise<LiveDMap<string, ReferableMapEntity<T[keyof T]>>> {
    const loader = this.debug.loadingInfo(
      `fetching collection ${this.name} from database.`
    )
    const data = await this.retrieveCollection()
    loader.succeed()
    const mutated = mutator(data)

    Files.writeFile(mutator(data), this.resourcePath)

    return new LiveDMap(this.makeReferableEntities(<T>mutated))
  }

  /**
   * The **readFromCache()** method retrieve data from saved cache.
   * @param autoFetch - Automatically fetch data from the database if it is not presented.
   */
  public async readFromCache(
    autoFetch = false
  ): Promise<DMap<string, ReferableMapEntity<T[keyof T]>> | null> {
    this.debug.info(`reading collection ${this.name} from cache.`)
    const data = Files.readFile<T>(this.resourcePath)
    if (!data) {
      this.debug.warn(
        `cached collection ${this.name} is not presented. autoFetch: ${
          autoFetch ? 'true' : 'false'
        }`
      )
      if (!autoFetch) return null
      return new LiveDMap(this.makeReferableEntities(this.fetch()))
    }

    return new DMap(this.makeReferableEntities(data.content))
  }
}
