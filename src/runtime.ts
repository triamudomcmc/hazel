import type { UserDataCollectionType } from 'lib'
import { ClubRecord, FirestoreCollection, Runtime } from 'lib'

new Runtime('PROD').runSnippet(async (debug) => {
  console.log('Re')
  const uCollection = new FirestoreCollection<UserDataCollectionType>('data')

  const uData = await uCollection.readFromCache()
  if (!uData) return

  const students = uData.filter((k, v) => v.get('level') !== '9')

  const grouped = students.groupBy((d) => d.get('club'))
  const mainClubGroup = new ClubRecord(
    grouped.getRecord()
  ).transformToMainClubs((a, b) => [...a, ...b])

  debug.table(
    mainClubGroup.map((k, v) => ({
      club: k,
      count: v.length
    }))
  )
})
