import { DMap } from './DMap'

/**
 * @category Lib
 */
export class IDMap extends DMap<string, string> {
  /**
   * The **swapKeyVal()** method swaps between object key and value.
   * @param obj - Object that will be swapped.
   * @private
   */
  private static swapKeyVal(obj: Record<string, string>) {
    return Object.fromEntries(Object.entries(obj).map((a) => a.reverse()))
  }

  /**
   * The **reverse()* method returns the swapped map.
   */
  public reverse(): IDMap {
    return new IDMap(IDMap.swapKeyVal(this.content))
  }
}
