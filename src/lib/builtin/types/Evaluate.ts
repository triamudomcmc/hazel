import type { SystemClubIDType } from './ClubID'

/**
 * @category Built-in
 */
export interface IEvaluateResult {
  action: 'passed' | 'failed' | 'resign' | 'break'
}

/**
 * @category Built-in
 */
export type EvaluateType = Record<string, IEvaluateResult>
/**
 * @category Built-in
 */
export type EvaluateCollectionType = Record<SystemClubIDType, EvaluateType>
