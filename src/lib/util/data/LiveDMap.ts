import { DMap } from './DMap'

/**
 * The **LiveDMap<K, V>()** class
 * live version of DMap
 * This usually return from live data sources e.g. databases
 * @category Lib
 */
export class LiveDMap<K extends string, V = any> extends DMap<K, V> {
  public isLive() {
    return true
  }
}
