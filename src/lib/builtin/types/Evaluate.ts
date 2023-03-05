import type { SystemClubIDType } from './ClubID'

export interface IEvaluateResult {
  action: 'passed' | 'failed' | 'resign' | 'break'
}

export type EvaluateType = Record<string, IEvaluateResult>
export type EvaluateCollectionType = Record<SystemClubIDType, EvaluateType>
