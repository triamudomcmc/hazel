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
  protected readonly name: string

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
   * Note: Different databases require different procedures to access its collection.
   * @protected
   * @override
   * @abstract
   */
  protected abstract retrieveCollection(): Promise<M>

  /**
   * The **handleChanges()** abstract method will be used to handle {@link DataChanges} to match the database required form.
   * Note: Different databases require different procedures to process DataChanges.
   * @param changes - Received changes.
   * @protected
   * @override
   * @abstract
   */
  protected abstract handleChanges(
    changes: DataChanges[]
  ): Promise<DataChanges[]>

  /**
   * The **verifyChanges()** abstract method will be used to verify changes pushed to the database.
   * Note: Different databases may require different procedures.
   * @param changes - Expected changes.
   * @protected
   * @override
   * @abstract
   */
  protected abstract verifyChanges(changes: DataChanges[]): Promise<boolean>

  /**
   * The **setDefaultMutator()** method set Collection's defaultMutator, which will be used when resources are being fetched automatically.
   * @param mutator - Mutator mutates raw collection data from the database to certain format check {@link Mutator} for some built-in mutators.
   */
  public setDefaultMutator(mutator: CollectionMutator<M>) {
    this.collectionMutator = mutator
    return this
  }

  /**
   * The **pushChanges()** method push incoming changes to the database.
   * @param changes - Received changes.
   * @param strict - Only allow LiveDMap changes to be pushed to the database.
   */
  public async pushChanges(changes: ChangeList, strict = true) {
    if (!changes.isLive && strict) {
      throw Error(
        `${ConsoleColour.BGRED}${ConsoleColour.BOLD}only changes from LiveDMap are pushable by default.${ConsoleColour.RESET} \n${ConsoleColour.BGYELLOW}Please do not push cached data to the database.${ConsoleColour.RESET}`
      )
    }

    return await this.verifyChanges(await this.handleChanges(changes.changes))
  }

  /**
   * The **makeReferableEntities()** method converts fetched data to {@link ReferableMapEntity}.
   * @param data - Fetched data
   */
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
   * @param [mutator] - Mutator mutates raw collection data from the database to certain format check {@link Mutator} for some built-in mutators.
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

  /**
   * The **readFromCacheNoRef()** method retrieve data from saved cache without referable property.
   * @param autoFetch - Automatically fetch data from the database if it is not presented.
   */
  public async readFromCacheNoRef(
    autoFetch = false
  ): Promise<DMap<string, T[keyof T]> | null> {
    this.debug.info(`reading collection ${this.name} from cache.`)
    const data = Files.readFile<T>(this.resourcePath)
    if (!data) {
      this.debug.warn(
        `cached collection ${this.name} is not presented. autoFetch: ${
          autoFetch ? 'true' : 'false'
        }`
      )
      if (!autoFetch) return null
      return this.fetchNoRef()
    }

    return new DMap(data.content)
  }

  /**
   * The **fetchNoRef()** method fetch the collection from database without referable property, mutate, and then save it as a cache.
   * @param [mutator] - Mutator mutates raw collection data from the database to certain format check {@link Mutator} for some built-in mutators.
   * @return Promise<T>
   */
  public async fetchNoRef(
    mutator: CollectionMutator<M> = this.collectionMutator
  ): Promise<LiveDMap<string, T[keyof T]>> {
    const loader = this.debug.loadingInfo(
      `fetching collection ${this.name} from database.`
    )
    const data = await this.retrieveCollection()
    loader.succeed()
    const mutated = mutator(data)

    Files.writeFile(mutator(data), this.resourcePath)

    return new LiveDMap(mutated)
  }
}
