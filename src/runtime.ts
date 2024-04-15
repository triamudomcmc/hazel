import type { SystemClubIDType } from 'lib'
import { ReferableMapEntity } from 'lib'
import { FirestoreCollection, Runtime } from 'lib'
import { DMapUtil } from 'lib'

new Runtime('PROD').runSnippet(async (debug) => {
  type Contact = {
    context: string
    type: string
  }
  type ClubDisplayCollection = Record<
    SystemClubIDType,
    {
      audition: boolean
      contact: Contact
      contact2: Contact
      contact3: Contact
      count: number
      description: string
      images: {
        mainImage: string
        'picture-1': string
        'picture-2': string
        'picture-3': string
      }
      nameEN: string
      nameTH: string
      reviews: {
        contact: string
        context: string
        name: string
        profile: string
        year: string
      }[]
    }
  >
  const cd = new FirestoreCollection<ClubDisplayCollection>(
    'clubDisplayPending'
  )
  const cdata = await cd.readFromCache()

  if (!cdata) return

  const d = cdata.get('ก30927')

  if (!d) return
  d.update('nameEN', 'test')
  const newEntity = new ReferableMapEntity(d.data(), 'ก30953-1')

  cdata.set('ก30953-1', newEntity)

  const chages = DMapUtil.buildChanges(cdata)
})
