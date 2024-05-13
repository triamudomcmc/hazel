import type { Contact } from './ClubData'
import type { SystemClubIDType } from './ClubID'

/**
 * @category Built-in
 */
export interface ClubDisplay {
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

/**
 * @category Built-in
 */
export type ClubDisplayCollection = Record<SystemClubIDType, ClubDisplay>
