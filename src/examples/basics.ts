import { ClubRecord, DMap, FirestoreCollection, ID, IDUtil } from '@lib'
import type { Debugger, EvaluateCollectionType } from '@lib'
import express, { Express, Request, Response } from 'express'

const app: Express = express()
const port: number = 3000

let result: string[] = [];

export const basicExampleSnippet = async (debug: Debugger) => {
  result = []

  // Initialise data collection
  const evalColl = new FirestoreCollection<EvaluateCollectionType>('evaluate')

  // Load data from the local cache and fetch if there was no cache.
  const evalData = await evalColl.readFromCache(true)
  if (!evalData) {
    return;
  }

  const evalRecords = new ClubRecord(evalData.getRecord())
  for (let item of evalRecords.keys()) {
    let elem = IDUtil.translateToClubName(item);
    result.push(elem);
  }
  debug.dump(result);

  app.get('/', function(req: Request, res: Response) {
  res.json(result);
})
}

app.listen(port, () => console.log(`Application is running on port ${port}`))
