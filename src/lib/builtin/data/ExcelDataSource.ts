import Excel from 'exceljs'

import { DataSource } from '../../util/data/DataSource'
import type { DataType } from '../../util/data/DataType'
import { Workbook } from './Workbook'

/**
 * @category Built-in
 */
export class ExcelDataSource<T extends DataType> extends DataSource {
  public async resolve(): Promise<Workbook<T>> {
    const workbook = new Excel.Workbook()
    const loadedWb = await workbook.xlsx.load(this.fileStream)
    const book: Record<string, string>[][] = []

    loadedWb.eachSheet((ws, _) => {
      const sheet: Record<string, string>[] = []
      ws.eachRow((r) => {
        const row: Record<string, string> = {}
        r.eachCell((c, cn) => {
          row[cn] = c.text
        })
        sheet.push(row)
      })
      book.push(sheet)
    })

    return new Workbook(book)
  }
}
