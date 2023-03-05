import type { MainClubIDType, SystemClubIDType } from '../../types/ClubID'
import { ID } from './ID'

export class IDUtil extends ID {
  public static applyOverriddenLayer(id: SystemClubIDType): string {
    const layer = this.overriddenTranslationLayer.reverse()
    if (layer.hasKey(id)) {
      const translated = layer.get(id)
      if (!translated) throw Error(`unable to translate ${id}`)
      return translated
    }

    return id
  }

  public static translateToClubName(id: SystemClubIDType): string {
    return this.systemClubs.get(id) || ''
  }

  public static translateToMainClubName(id: MainClubIDType): string {
    return this.mainClubs.get(id) || ''
  }
}
