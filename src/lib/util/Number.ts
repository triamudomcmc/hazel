export class NumberUtil {
  /**
   * The **zeroPad()** method pad 1-char-length number.
   * @param d - Any number
   * @returns The zero-leading string of provided number.
   */
  public static zeroPad(d: number): string {
    if (d.toString().length === 1) {
      return `0${d.toString()}`
    }

    return d.toString()
  }
}
