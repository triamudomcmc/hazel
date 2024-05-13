import { NumberUtil } from '../Number'

interface Time {
  t: {
    h: string
    m: string
    s: string
  }
  d: {
    d: string
    m: string
    y: string
  }
}

/**
 * @category Lib
 */
export class TimestampUtil {
  /**
   * The **currentTime()** method get current timestamp.
   * @param [timestamp] - Specify the timestamp
   * @param padMethod - Padding method
   * @returns timestamp in {@link Time} format.
   */
  public static currentTime(
    timestamp?: number,
    padMethod = NumberUtil.zeroPad
  ): Time {
    let dateTime: Date
    if (timestamp) {
      dateTime = new Date(timestamp)
    } else {
      dateTime = new Date()
    }

    return {
      t: {
        h: padMethod(dateTime.getHours()),
        m: padMethod(dateTime.getMinutes()),
        s: padMethod(dateTime.getSeconds())
      },
      d: {
        d: padMethod(dateTime.getDate()),
        m: padMethod(dateTime.getMonth() + 1),
        y: padMethod(dateTime.getFullYear())
      }
    }
  }
}
