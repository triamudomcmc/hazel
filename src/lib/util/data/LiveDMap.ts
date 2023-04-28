import { DMap } from './DMap'

export class LiveDMap<K extends string, V = any> extends DMap<K, V> {
  public isLive() {
    return true
  }
}
