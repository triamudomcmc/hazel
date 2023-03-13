import type { SystemClubIDType } from './ClubID'

/**
 * @category Built-in
 */
export interface IUserData {
  student_id: string
  title: string
  firstname: string
  lastname: string
  room: string
  level: string
  number: string
  club: SystemClubIDType
  cardID?: string
  old_club?: SystemClubIDType
  position?: Record<SystemClubIDType, number>
  audition?: Record<SystemClubIDType, string>
  panelID?: SystemClubIDType[]
  tucmc?: boolean
}

/**
 * @category Built-in
 */
export type UserDataCollectionType = Record<string, IUserData>
