import * as crypto from 'crypto'

import type { DataType } from '../../util/data/DataType'
import { DMap } from '../../util/data/DMap'
import type { IUserData, UserDataCollectionType } from '../types/UserData'
import { ID } from './ID/ID'

export type SimulatedDataPreset<T extends DataType> = T

/**
 * @category Built-in
 */
export class SimulatedDataPresets {
  private static randomNoise() {
    return (+new Date() * Math.random()).toString(36).substring(0, 6)
  }

  private static readonly rooms = [
    65, 66, 70, 71, 72, 276, 277, 278, 341, 342, 343, 344, 345, 437, 438, 446,
    447, 448, 661, 662, 664, 665, 666, 667, 834, 835, 842, 843, 844, 845, 846,
    942, 943, 945, 946, 947, 332, 333, 334, 335, 336, 431, 432, 436, 443, 444,
    445, 642, 651, 652, 654, 655, 656, 657, 812, 813, 814, 815, 822, 823, 824,
    825, 832, 833, 931, 932, 933, 934, 935, 936, 937, 941, 28, 29, 32, 38, 39,
    48, 49, 58, 59, 73, 74, 75, 76, 77, 78, 79, 80, 81, 125, 126, 143, 144, 145,
    146, 153, 154, 155, 156, 222, 223, 224, 225, 226, 227, 228, 229
  ]
  private static readonly titleList = ['นาย', 'นางสาว', 'เด็กหญิง', 'เด็กชาย']

  public static RandomStudents(): SimulatedDataPreset<UserDataCollectionType> {
    const data = new DMap<string, IUserData>({})
    const roomC = 45
    const count = this.rooms.length * roomC

    for (let c = 0; c < count; c++) {
      const uuid = crypto.randomUUID()
      const rn = this.randomNoise()
      const title = this.titleList[
        Math.floor(Math.random() * this.titleList.length)
      ] as string

      data.set(`simulated-${uuid}`, {
        student_id: `id-${uuid}`,
        firstname: `firstname-${rn}`,
        lastname: `lastname-${rn}`,
        title: title,
        room:
          (this.rooms[Math.floor((c + 1) / roomC)] || '999').toString(10) ||
          '999',
        level: (Math.floor(Math.floor((c + 1) / roomC) / 36) + 4).toString(10),
        number: (((c + 1) % roomC) + 1).toString(10),
        old_club: [...ID.systemClubs.keys(), ''][
          Math.floor(Math.random() * ID.systemClubs.keys().length + 1)
        ] as string,
        club: ID.systemClubs.keys()[
          Math.floor(Math.random() * ID.systemClubs.keys().length)
        ] as string
      })
    }
    return data.getRecord()
  }
}
