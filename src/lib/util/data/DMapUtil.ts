import type { DMap } from '@lib'
import { Debugger } from '@lib'
import fs from 'fs'

import type { LiveDMap } from './LiveDMap'
import type { ReferableMapEntity } from './ReferableEntity'

export interface DataChanges {
  type: 'update' | 'delete' | 'create'
  _docID?: string
  from: Partial<any>
  to: Partial<any>
}

export interface ChangeList {
  isLive: boolean
  changes: DataChanges[]
}

export class DMapUtil {
  private static debug = new Debugger('DMapUtil')

  public static buildChanges(
    data:
      | DMap<string, ReferableMapEntity<any>>
      | LiveDMap<string, ReferableMapEntity<any>>
      | ReferableMapEntity<any>[]
  ): ChangeList {
    const fname = `${new Date().getTime()}.json`
    this.debug.info(`generating review file ${fname}`)

    let changes
    let live = false
    if (Array.isArray(data)) {
      changes = data
        .filter((v) => v.isEdited())
        .map((v): DataChanges => {
          return {
            type: !v.document ? 'create' : v.isDeleted() ? 'delete' : 'update',
            _docID: v.document,
            from: v.saved,
            to: v.document ? v.changes : v.getOriginal()
          }
        })
    } else {
      live = data.isLive()
      if (!data.isLive()) {
        this.debug.warn(
          'changes from cached DMap are not accepted by the database changes handler by default.'
        )
      }
      changes = data
        .filter((_, v) => v.isEdited())
        .map((_, v): DataChanges => {
          return {
            type: !v.document ? 'create' : v.isDeleted() ? 'delete' : 'update',
            _docID: v.document,
            from: v.saved,
            to: v.document ? v.changes : v.getOriginal()
          }
        })
    }

    const deletion = changes.filter((c) => c.type === 'delete')
    const update = changes.filter((c) => c.type === 'update')
    const create = changes.filter((c) => c.type === 'create')

    this.debug.info(
      `change analysed with ${changes.length} entities affected (${deletion.length} deletion, ${update.length} update, ${create.length} creation).`
    )

    fs.writeFileSync(
      `review/${process.env.RUNTIME_MODE}/${fname}`,
      JSON.stringify(changes, null, 4)
    )

    return { changes: changes, isLive: live }
  }
}
