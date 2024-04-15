import type { SystemClubIDType } from './ClubID'

type Contact =
  | {
      context: string
      type: string
    }
  | {}

/**
 * @category Built-in
 */
export interface ClubData {
  audition: boolean
  call_count: number
  committees: string[] | undefined
  contact: Contact
  contact2: Contact
  contact3: Contact
  count_limit: number
  m4: number
  maxPos: number | Record<string, number>
  message: string
  new_count: number
  new_count_limit: number
  old_count: number
  old_count_limit: number
  place: string
  status: string
  teacher_count: number
  title: string
  sections?: string[]
}

/**
 * @category Built-in
 */
export type ClubDataCollection = Record<SystemClubIDType, ClubData>
