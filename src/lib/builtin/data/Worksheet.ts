import type { DataType } from '@lib'
import { DMap } from '@lib'

type ExcelRowsRecord<T> = T[] | Record<string, string>[]

export class Worksheet<T extends DataType> {
  private rawData: Record<string, string>[]
  private data: T[] | null = null
  public name: string | undefined = undefined

  constructor(data: Record<string, string>[] | T[]) {
    this.rawData = data
  }

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

  public setName(name: string): Worksheet<T> {
    this.name = name
    return this
  }
}
