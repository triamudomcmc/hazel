import type { EvaluateCollectionType } from '@lib'
import { ClubRecord, DMap, FirestoreCollection, ID, Runtime } from '@lib'

new Runtime('PROD').runSnippet(async (debug) => {
  /*
  This example demonstrate the basic usages of lab resources.
  By utilising Resource Control Class ex. Collection()
  and Data Controls ex. ClubRecord() and DMap()
   */

  // Initialise data collection
  const evalColl = new FirestoreCollection<EvaluateCollectionType>('evaluate')

  // Load data from the local cache and fetch if there was no cache.
  const evalData = await evalColl.readFromCache(true)
  if (!evalData) return

  const evalRecords = new ClubRecord(evalData)

  // Compare keys with systemClubs using keyDiff() method.
  const missing = ID.systemClubs.keyDiff(evalRecords.keys())
  debug.dump(missing)

  // Merge all sub clubs to main club.
  const mainClubRecords = evalRecords.transformToMainClubs()

  /*
  Accessing a key using get() method
  Note: get() method arg should be suggested by the editor (In this case is clubID).
   */
  const clubEvalData = mainClubRecords.get('ก30927')
  if (!clubEvalData) return

  // Encapsulate the record with DMap and access its utility methods.
  debug.dump(new DMap(clubEvalData).size())
})
