import {
  ClubRecord,
  DMap,
  FirestoreCollection,
  IDUtil,
  Mutators
} from '@lib'
import type {
  Debugger,
  EvaluateCollectionType,
  UserDataCollectionType
} from '@lib'

import { Workbook } from '../lib/builtin/data/Workbook'
import { Worksheet } from '../lib/builtin/data/Worksheet'

export const HazelSnippet = async (debug: Debugger) => {
  const evalCol = new FirestoreCollection<EvaluateCollectionType>('evaluate')
  const users = new FirestoreCollection<UserDataCollectionType>(
    'data'
  ).setDefaultMutator(
    Mutators.SpecificKeyFieldKVMutator((doc) => doc.get('student_id'))
  )
  
  const [evalData, userData] = await Promise.all([evalCol.readFromCache(true), users.readFromCache(true)])
  
  if (!evalData || !userData) {
    return
  }

  const evalRecords = new ClubRecord(evalData.getRecord())

  const books = evalRecords.map((clubId, val) => {
    const sheetData = new DMap(val.data()).map((key, val) => {
      let student = userData.findValues(
        (userDataItem) => userDataItem.get('student_id') === `${key}`
      )

      const studentInfo = {
        title: student[0]?.get('title'),
        firstname: student[0]?.get('firstname'),
        lastname: student[0]?.get('lastname'),
        number: student[0]?.get('number'),
        room: student[0]?.get('room')
      }

      return {
        ID: key,
        clubid: clubId,
        clubs: IDUtil.translateToClubName(clubId),
        ...studentInfo,
        report: val.action
      }
    })

    return new Worksheet(sheetData).setName(clubId)
  })

  const workbook = new Workbook(books)

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

  workbook.save('evals.xlsx')
}
