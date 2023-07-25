/**
 * @category Built-in
 */
export interface TrackingDetail {
  context: string
  fingerPrint: string
  timestamp: number
  type: string
  userID: string | null
}

/**
 * @category Built-in
 */
export type TrackerCollection = Record<string, TrackingDetail>
