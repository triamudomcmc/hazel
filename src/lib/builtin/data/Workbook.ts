import type { DataType } from '@lib'
import { DMap } from '@lib'
import Excel from 'exceljs'

import { Worksheet } from './Worksheet'

export type GenerationPattern = (
  worksheet: Excel.Worksheet,
  appendSheetData: (keysIncluded: boolean) => void
) => void

export type CellStyle = (
  location: { s: string; c: number; r: number },
  cell: Excel.Cell
) => void

/**
 * The **Workbook<T>()** class
 * create a workbook instance, which contains multiple worksheets.
 * @category Built-in
 */
export class Workbook<T extends DataType> {
  public readonly book: Worksheet<T>[]
  private workbook = new Excel.Workbook()
  private generateSheet: GenerationPattern = (worksheet, appendSheetData) => {
    appendSheetData(true)
  }
  private cellStyle: CellStyle = () => {}

  constructor(book: Record<string, string>[][])
  constructor(sheets: Worksheet<T>[])

  constructor(param: Worksheet<T>[] | Record<string, string>[][]) {
    if (param.length < 1) {
      this.book = []
      return
    }

    if (param[0] instanceof Worksheet) {
      this.book = param as Worksheet<T>[]
    } else {
      this.book = param.map((rs) => {
        const rawSheet = rs as Record<string, string>[]
        return new Worksheet<T>(rawSheet)
      })
    }
  }

  /**
   * The **getSheet()** method returns the {@link Worksheet} from the provided page.
   */
  public getSheet(page: number): Worksheet<T> | undefined {
    return this.book[page]
  }

  /**
   * The **addSheet()** method appends the provided sheet to the book.
   */
  public addSheet(sheet: Worksheet<T>) {
    this.book.push(sheet)
  }

  /**
   * The **setGenerationPattern()** method sets the generation pattern of the book.
   */
  public setGenerationPattern(pattern: GenerationPattern) {
    this.generateSheet = pattern
  }

  /**
   * The **applyStyle()** method applies cell style to the book.
   */
  private applyStyle(s: Worksheet<T>, sheet: Excel.Worksheet, keys: boolean) {
    const rows = s.getRecords()
    if (keys && rows[0]) {
      rows.push(rows[0] as T)
    }

    rows.forEach((d, r) => {
      const de = new DMap(d)
      de.iterateSync((k, v, c) => {
        this.cellStyle(
          { s: s.name as string, c: c + 1, r: r + 1 },
          sheet.getCell(r + 1, c + 1)
        )
      })
    })
  }

  /**
   * The **setStyle()** method sets the style registry for the worksheet.
   * @param ce - Cell's style registry.
   */
  public setStyle(ce: CellStyle) {
    this.cellStyle = ce
  }

  private appendSheetData(
    s: Worksheet<T>,
    sheet: Excel.Worksheet,
    keys: boolean
  ) {
    let ckeys = keys
    s.getRecords().forEach((d) => {
      if (ckeys) {
        sheet.addRow(new DMap(d).keys())
        ckeys = false
      }
      sheet.addRow(new DMap(d).values())
    })
  }

  private generateWorkbook() {
    this.book.forEach((s) => {
      const sheet = this.workbook.addWorksheet(s.name)
      let ik = true
      this.generateSheet(sheet, (keys) => {
        this.appendSheetData(s, sheet, keys)
        ik = keys
      })
      this.applyStyle(s, sheet, ik)
    })
  }

  /**
   * The **save()** method saves the current book as an XLSX file.
   */
  public async save(path: string) {
    if (this.workbook.worksheets.length === 0) {
      this.generateWorkbook()
    }
    await this.workbook.xlsx.writeFile(path)
  }

  /**
   * The **saveAsCSV()** method saves the current book as a CSV file.
   */
  public async saveAsCSV(path: string) {
    if (this.workbook.worksheets.length === 0) {
      this.generateWorkbook()
    }
    await this.workbook.csv.writeFile(path)
  }
}
