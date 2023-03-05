import type { Debugger, UserDataCollectionType } from '@lib'
import { DMap, FirestoreCollection, IDUtil, Mutator } from '@lib'

const mutatorExampleSnippet = async (debug: Debugger) => {
  /*
  This example demonstrates the usage of mutator.
  By accessing users' data and perform a basic query.
   */

  // Initialise user data collection.
  const users = new FirestoreCollection<UserDataCollectionType>(
    'data'
  ).setDefaultMutator(
    Mutator.SpecificKeyFieldKVMutator((doc) => doc.get('student_id'))
  )

  // Load data from the local cache and fetch if there was no cache.
  const userData = await users.readFromCache(true)
  if (!userData) return

  // Encapsulate the record with DMap and access its utility methods.
  const userDataMap = new DMap(userData)

  // Find every student that their room property is 59.
  let students = userDataMap.findValues((v) => v.room === '59')

  // Perform basic data array operations
  // Sort by number
  students = students.sort(
    (a, b) => parseInt(a.number, 10) - parseInt(b.number, 10)
  )

  // Display data array
  debug.table(
    students.map((u) => ({
      number: u.number,
      student_id: u.student_id,
      club: u.club,
      clubName: IDUtil.translateToClubName(u.club)
    }))
  )
}
