import type { DataType } from '../../util/data/DataType'
import { DMap } from '../../util/data/DMap'

type ExcelRowsRecord<T> = T[] | Record<string, string>[]

/**
 * The **Worksheet<T>()** class
 * create a worksheet instance, which contains data.
 * @category Built-in
 */
export class Worksheet<T extends DataType> {
  private rawData: Record<string, string>[]
  private data: T[] | null = null
  public name: string | undefined = undefined

  constructor(data: Record<string, string>[] | T[]) {
    this.rawData = data
  }

  /**
   * The **assignColumnName()** method assigns the name to sheet columns.
   * @param column - Column name array.
   */
  public assignColumnName(column: (keyof T)[]): Worksheet<T> {
    this.data = this.rawData
      .map((d) => {
        const nmap: Record<string, string> = {}
        new DMap(d).iterateSync((k, v) => {
          const key = column[parseInt(k) - 1]
          if (!key) return
          if (key.toString() === v) return
          nmap[key.toString()] = v
          return
        })
        return nmap
      })
      .filter((a) => Object.keys(a).length !== 0) as T[]

    return this
  }

  public getRecords(): ExcelRowsRecord<T> {
    return this.data || this.rawData
  }

  /**
   * The **setName()** method assigns sheet name.
   * @param name - Sheet name.
   */
  public setName(name: string): Worksheet<T> {
    this.name = name
    return this
  }
}
