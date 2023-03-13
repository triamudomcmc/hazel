import type { DataType } from '../../../util/data/DataType'
import { DMap } from '../../../util/data/DMap'
import type { MainClubIDType, SystemClubIDType } from '../../types/ClubID'
import { ID } from '../ID/ID'

/**
 * The **ClubRecord<T extends {@link SystemClubIDType} | {@link MainClubIDType}>()** class
 * encapsulate any object with {@link DataType} value and provides utilities method.
 * @category Built-in
 */
export class ClubRecord<
  T extends SystemClubIDType | MainClubIDType,
  V extends DataType
> extends DMap<T, V> {
  /**
   * The **ClubRecord<T extends {@link SystemClubIDType} | {@link MainClubIDType}>()** class
   * encapsulate any object with {@link DataType} value and provides utilities method.
   */
  constructor(props: Record<T, V>) {
    super(props)
  }

  private static readonly defaultMergeFunc = <MV extends DataType>(
    prevValue: MV,
    newValue: MV
  ): MV => ({
    ...prevValue,
    ...newValue
  })

  /**
   * The **transformToMainClubs()** method transforms ClubRecord with SystemClubID indexes
   * to new ClubRecord with MainClubID indexes by merging its properties using **mergeFunc**.
   * @param mergeFunc - Merge function controls how an existed object will be merged. Look {@link defaultMergeFunc} for example.
   */
  public transformToMainClubs(
    mergeFunc = ClubRecord.defaultMergeFunc
  ): ClubRecord<MainClubIDType, V> {
    const transformed: Record<MainClubIDType, V> = {}

    // eslint-disable-next-line no-restricted-syntax
    for (const [k, v] of Object.entries(this.content)) {
      let dk = k
      if (ID.mainClubsTranslationLayer.hasKey(k)) {
        dk = <string>ID.mainClubsTranslationLayer.get(k)
      }

      if (dk in transformed) {
        transformed[dk] = mergeFunc(<V>transformed[dk], <V>v)
      } else {
        transformed[dk] = <V>v
      }
    }

    return new ClubRecord<MainClubIDType, V>(transformed)
  }
}
