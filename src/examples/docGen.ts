import type {
  Debugger,
  EvaluateCollectionType,
  UserDataCollectionType
} from '@lib'
import {
  ClubRecord,
  DMap,
  DocumentTemplate,
  EvaluationDocument,
  FirestoreCollection,
  Mutators
} from '@lib'

export const docGenSnippet = async (debug: Debugger) => {
  const eCollection = new FirestoreCollection<EvaluateCollectionType>(
    'evaluate'
  )
  const eData = await eCollection.readFromCacheNoRef(true)
  if (!eData) return

  const uData = await new FirestoreCollection<UserDataCollectionType>('data')
    .setDefaultMutator(
      Mutators.SpecificKeyFieldKVMutator((doc) => doc.get('student_id'))
    )
    .readFromCache(true)
  if (!uData) return

  const eMap = new ClubRecord(eData.getRecord()).transformToMainClubs()
  const template = new DocumentTemplate('assets/eTemplate.html')

  await eMap.iterate(async (key, value) => {
    debug.info(`working on ${key}`)

    const clubEMap = new DMap(value)

    const grouped = clubEMap.groupBy((v) => v.action)

    const doc = new EvaluationDocument(
      key,
      {
        semester: '2',
        year: '2566'
      },
      {
        all: clubEMap,
        ...grouped.getRecord()
      },
      uData
    )

    await doc.generate(template, `${key}`)
  })
}
