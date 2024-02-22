import type { Debugger, EvaluateCollectionType } from '@lib'
import { ClubRecord, DMap, FirestoreCollection } from '@lib'

import { Workbook } from '../lib/builtin/data/Workbook'
import { Worksheet } from '../lib/builtin/data/Worksheet'

export const basicExcel = async (debug: Debugger) => {
  /*
  This example demonstrates the basic usages of lab resources.
  By utilising Resource Control Class ex. Collection()
  and Data Controls ex. ClubRecord() and DMap()
   */

  // Initialise data collection
  const evalColl = new FirestoreCollection<EvaluateCollectionType>('evaluate')
  const users = new FirestoreCollection<UserDataCollectionType>(
    'data'
  ).setDefaultMutator(
    Mutators.SpecificKeyFieldKVMutator((doc) => doc.get('student_id'))
  )

  // Load data from the local cache and fetch if there was no cache.
  const evalData = await evalColl.readFromCache(true)
  if (!evalData) {
    return
  }

  const evalRecords = new ClubRecord(evalData.getRecord())

  // Mutate data to a table compatible form and create sheets.
  const book = evalRecords.map((clubId, v) => {
    const sheetData = new DMap(v.data()).map((k, v) => ({
      ID: k,
      report: v.action
    }))

    return new Worksheet(sheetData).setName(clubId)
  })

  // Create a workbook
  const workbook = new Workbook(book)

  workbook.setStyle((l, cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }

    if (l.r === 1) {
      cell.font = { bold: true }
      cell.alignment = { horizontal: 'center' }
    }

    if (l.c === 2) {
      cell.alignment = { horizontal: 'center' }
    }
  })

  // Save the workbook as .xlsx file.
  workbook.save('evals.xlsx')
}
