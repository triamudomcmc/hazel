import type { Debugger, EvaluateCollectionType } from '../lib'
import { ClubRecord, DMap, FirestoreCollection } from '../lib'

export const advancedDataMappingSnippet = async (debug: Debugger) => {
  /*
 This example demonstrates some advance usages of DMap map() method.
 By constructing each evaluation's state count for every club.
  */

  // Initialise and read collection
  const evalColl = new FirestoreCollection<EvaluateCollectionType>('evaluate')
  const evalData = await evalColl.readFromCache(true)
  if (!evalData) return

  // Encapsulate evalData with ClubRecord
  const evalMap = new ClubRecord(evalData.getRecord())

  // Create each state count for every club
  const allCountMap = evalMap.map((k, v) => {
    // Group evaluation data by state value
    const groupedByAction = new DMap(v.data()).groupBy((d) => d.action)

    // Map grouped record to [state]: count form
    const countMap = groupedByAction.map((gk, gv) => ({
      [gk]: gv?.length
    }))

    // Return result object
    return {
      club: k,
      ...new DMap(countMap).getRecord()
    }
  })

  debug.pauseForAnyKey('Press any key to get table result.')
  debug.table(allCountMap)
}
