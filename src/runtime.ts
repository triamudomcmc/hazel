import { IDUtil, Runtime } from '@lib'

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
  )

  // Fetch data
  const userData = await users.fetch()
  if (!userData) return

  // Find every student that their room property is 59.
  const students = userData.findValues((v) => v.get('room') === '59')

  // Display data array
  debug.table(
    students.map((u) => ({
      number: u.get('number'),
      student_id: u.get('student_id'),
      club: u.get('club'),
      clubName: IDUtil.translateToClubName(u.get('club'))
    }))
  )
})
