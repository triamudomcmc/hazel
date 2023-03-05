import path from 'path'

import type { DataType } from '../data/DataType'
import { Debugger } from '../debugger/Debugger'
import { Files } from '../io/Files'

export type CollectionMutator<T> = (d: T) => DataType

/**
 * @template T, M
 * @constructor
 */
export abstract class Collection<T extends DataType, M = any> {
  private readonly name: string

  private debug = new Debugger(this.constructor.name || 'Collection')

  protected abstract collectionMutator: CollectionMutator<M>

  private rootPath = 'resource/collection'

  private readonly resourcePath: string

  /**
   * The **Collection<T>()** class hold data resources. User can choose either fetch from database or cache.
   * @param name - The collection name.
   */
  constructor(name: string) {
    this.name = name
    this.resourcePath = path.join(this.rootPath, `${this.name}.json`)
  }

  protected abstract retrieveCollection(collectionName: string): Promise<M>

  /**
   * The **setDefaultMutator()** method set Collection's defaultMutator, which will be used when resource are being fetched automatically.
   * @param mutator - Mutator mutates raw collection data from the database to certain format check {@link Mutator} for some built-in mutators.
   */
  public setDefaultMutator(mutator: CollectionMutator<M>): Collection<T> {
    this.collectionMutator = mutator
    return this
  }

  /**
   * The **fetch()** method fetch the collection from database, mutate, and then save it as a cache.
   * @param [mutator] - Mutator mutates raw collection data from the database to certain format check {@link Mutator} for some built-in mutators.
   * @return Promise<T>
   */
  public async fetch(
    mutator: CollectionMutator<M> = this.collectionMutator
  ): Promise<T> {
    const loader = this.debug.loadingInfo(
      `fetching collection ${this.name} from database.`
    )
    const data = await this.retrieveCollection(this.name)
    loader.succeed()
    const mutated = mutator(data)

    Files.writeFile(mutator(data), this.resourcePath)

    return <T>mutated
  }

  /**
   * The **readFromCache()** method retrieve data from saved cache.
   * @param autoFetch - Automatically fetch data from the database if it is not presented.
   */
  public async readFromCache(autoFetch = false): Promise<T | null> {
    this.debug.info(`reading collection ${this.name} from cache.`)
    const data = Files.readFile<T>(this.resourcePath)
    if (!data) {
      this.debug.warn(
        `cached collection ${this.name} is not presented. autoFetch: ${
          autoFetch ? 'true' : 'false'
        }`
      )
      if (!autoFetch) return null
      return this.fetch()
    }

    return data.content
  }
}
