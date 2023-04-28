import * as fs from 'fs'

export abstract class DataSource {
  protected fileStream: Buffer

  constructor(path: string) {
    this.fileStream = fs.readFileSync(path)
  }

  public abstract resolve(): Promise<any>
}
