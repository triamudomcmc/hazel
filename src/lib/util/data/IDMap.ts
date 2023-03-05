import { DMap } from './DMap'

export class IDMap extends DMap<string, string> {
  private static swapKeyVal(obj: Record<string, string>) {
    return Object.fromEntries(Object.entries(obj).map((a) => a.reverse()))
  }

  public reverse(): IDMap {
    return new IDMap(IDMap.swapKeyVal(this.content))
  }
}
