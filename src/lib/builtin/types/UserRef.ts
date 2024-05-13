/**
 * @category Built-in
 */
export interface UserRef {
  break: boolean
  firstname: string
  lastname: string
  level: string
  number: string
  room: string
  student_id: string
  title: string
}

/**
 * @category Built-in
 */
export type UserRefCollection = Record<string, UserRef>
