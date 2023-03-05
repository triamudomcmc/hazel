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
  Mutator
} from '@lib'

export const docGenSnippet = async (debug: Debugger) => {
  const eCollection = new FirestoreCollection<EvaluateCollectionType>(
    'evaluate'
  )
  const eData = await eCollection.readFromCache(true)
  if (!eData) return

  const uData = await new FirestoreCollection<UserDataCollectionType>('data')
    .setDefaultMutator(
      Mutator.SpecificKeyFieldKVMutator((doc) => doc.get('student_id'))
    )
    .readFromCache(true)
  if (!uData) return

  const eMap = new ClubRecord(eData).transformToMainClubs()
  const template = new DocumentTemplate('assets/eTemplate.html')

  await eMap.iterate(async (key, value) => {
    debug.info(`working on ${key}`)
    const clubEMap = new DMap(value)

    const grouped = clubEMap.groupBy((v) => v.action)

    const doc = new EvaluationDocument(
      key,
      {
        semester: '2',
        year: '2565'
      },
      {
        all: clubEMap,
        ...grouped
      },
      new DMap(uData)
    )

    await doc.generate(template, `${key}`)
  })
}
