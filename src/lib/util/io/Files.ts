import fs from 'fs'

import { Debugger } from '../debugger/Debugger'
import { TimestampUtil } from '../time/Timestamp'

export class Files {
  private static debug = new Debugger('IOUnit')

  public static writeFile(c: { [key: string]: any }, dest: string) {
    try {
      const file = {
        exported: new Date().getTime(),
        content: c
      }

      fs.writeFileSync(dest, JSON.stringify(file))
      this.debug.info(`exported file saved at ${dest}`)
    } catch (e) {
      this.debug.err(e)
    }
  }

  public static readFile<T extends { [key: string]: any }>(
    path: string
  ): { exported: number; content: T } | null {
    try {
      const data = JSON.parse(fs.readFileSync(path).toString())
      const { t, d } = TimestampUtil.currentTime(data.exported)

      this.debug.info(
        `read exported record from ${path} \nrecord created ${t.h}:${t.m} ${d.d}/${d.m}/${d.y}`
      )

      return data
    } catch (e) {
      this.debug.err(e)
      return null
    }
  }
}
