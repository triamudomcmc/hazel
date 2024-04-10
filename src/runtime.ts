import {
  ClubRecord,
  DMap,
  DocumentTemplate,
  EvaluationDocument,
  Mutators,
  Runtime
} from '@lib'

import { SimulatedCollection } from './lib/builtin/data/SimulatedCollection'
import { SimulatedDataPresets } from './lib/builtin/data/SimulatedDataPresets'

new Runtime('DEV').runSnippet(async (debug) => {
  /*
  This example demonstrates the usage of Simulated Collection.
  By accessing users' data and perform a basic query.
   */

  // Initialise user data collection.
  const users = new SimulatedCollection(
    'data',
    SimulatedDataPresets.RandomStudents()
  ).setDefaultMutator(Mutators.SimulatedUserMutator())

  // Fetch data
  const userData = await users.fetch()
  if (!userData) return

  const evald = new SimulatedCollection(
    'eval',
    SimulatedDataPresets.RandomEvaluation(userData)
  )

  const evaldata = await evald.fetchNoRef()
  if (!evaldata) return

  const eMap = new ClubRecord(evaldata.getRecord()).transformToMainClubs()
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
      userData
    )

    await doc.generate(template, `${key}`)
  })
})
