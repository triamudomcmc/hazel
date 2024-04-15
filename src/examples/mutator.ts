import type { Debugger, UserDataCollectionType } from '../lib'
import { FirestoreCollection, IDUtil, Mutators } from '../lib'

const mutatorExampleSnippet = async (debug: Debugger) => {
  /*
  This example demonstrates the usage of mutator.
  By accessing users' data and perform a basic query.
   */

  // Initialise user data collection.
  const users = new FirestoreCollection<UserDataCollectionType>(
    'data'
  ).setDefaultMutator(
    Mutators.SpecificKeyFieldKVMutator((doc) => doc.get('student_id'))
  )

  // Load data from the local cache and fetch if there was no cache.
  const userData = await users.readFromCache(true)
  if (!userData) return

  // Find every student that their room property is 59.
  let students = userData.findValues((v) => v.get('room') === '59')

  // Perform basic data array operations
  // Sort by number
  students = students.sort(
    (a, b) => parseInt(a.get('number'), 10) - parseInt(b.get('number'), 10)
  )

  // Display data array
  debug.table(
    students.map((u) => ({
      number: u.get('number'),
      student_id: u.get('student_id'),
      club: u.get('club'),
      clubName: IDUtil.translateToClubName(u.get('club'))
    }))
  )
}
