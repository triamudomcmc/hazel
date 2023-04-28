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

    if (param[0] instanceof Worksheet<T>) {
      this.book = param as Worksheet<T>[]
    } else {
      this.book = param.map((rs) => {
        const rawSheet = rs as Record<string, string>[]
        return new Worksheet<T>(rawSheet)
      })
    }
  }

  public getSheet(page: number): Worksheet<T> | undefined {
    return this.book[page]
  }

  public addSheet(sheet: Worksheet<T>) {
    this.book.push(sheet)
  }

  public setGenerationPattern(pattern: GenerationPattern) {
    this.generateSheet = pattern
  }

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

  public save(path: string) {
    if (this.workbook.worksheets.length === 0) {
      this.generateWorkbook()
    }
    this.workbook.xlsx.writeFile(path)
  }

  public saveAsCSV(path: string) {
    if (this.workbook.worksheets.length === 0) {
      this.generateWorkbook()
    }
    this.workbook.csv.writeFile(path)
  }
}
