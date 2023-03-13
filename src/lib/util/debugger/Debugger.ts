import type { Ora } from 'ora'
import ora from 'ora'
import rsync from 'readline-sync'

import { NumberUtil } from '../Number'
import { ConsoleColour } from './Colour'

/**
 * The **Debugger()** class provides basics console interaction for the unit.
 * @category Lib
 */
export class Debugger {
  private readonly unit: string

  /**
   * The **Debugger()** class provides basics console interaction for the unit.
   * @constructor
   * @param unit - Unit name
   */
  constructor(unit: string) {
    this.unit = unit
  }

  /**
   * The **debugTimestamp()** method returns runtime's timestamp in HH:MM:SS format.
   * @private
   */
  private static debugTimestamp(): string {
    const date = new Date()

    return `${NumberUtil.zeroPad(date.getHours())}:${NumberUtil.zeroPad(
      date.getMinutes()
    )}:${NumberUtil.zeroPad(date.getSeconds())}`
  }

  /**
   * The **info()** method logs the given text message to the console.
   * @param message - Any preferred string message.
   */
  public info(message: string): void {
    console.info(
      `${Debugger.debugTimestamp()} | ${this.unit} | ${
        ConsoleColour.GRAY
      }${message} ${ConsoleColour.RESET}`
    )
  }

  /**
   * The **loadingInfo()** method prints a spinner with a given message to the console.
   * @returns A spinner controller.
   * @param loadingText - Any preferred string message.
   */
  public loadingInfo(loadingText: string): Ora {
    const spinner = ora()
    spinner.prefixText = `${Debugger.debugTimestamp()} | ${this.unit} | ${
      ConsoleColour.GRAY
    }`
    spinner.start(loadingText + '\n')
    spinner.text = loadingText
    return spinner
  }

  /**
   * The **dump()** method dumps any data into the console similar to **console.log()**.
   * @param data
   */
  public dump(data: any): void {
    console.log(
      `${Debugger.debugTimestamp()} | ${this.unit} | ${ConsoleColour.GRAY}`,
      data,
      ConsoleColour.RESET
    )
  }

  /**
   * The **table()** method dumps any array data as a table into the console similar to **console.table()**.
   * @param data
   */
  public table(data: any): void {
    console.log(
      `${Debugger.debugTimestamp()} | ${this.unit} | ${
        ConsoleColour.GRAY
      } vvv TABLE vvv ${ConsoleColour.RESET}`
    )
    console.table(data)
  }

  /**
   * The **err()** method logs the given text message to the console similar to **console.error()**.
   * @param message - Any preferred string message.
   */
  public err(message: any): void {
    console.error(
      `${Debugger.debugTimestamp()} | ${this.unit} | ${
        ConsoleColour.RED
      }${message} ${ConsoleColour.RESET}`
    )
  }

  /**
   * The **warn()** method logs the given text message to the console similar to **console.warn()**.
   * @param message - Any preferred string message.
   */
  public warn(message: string): void {
    console.warn(
      `${Debugger.debugTimestamp()} | ${this.unit} | ${
        ConsoleColour.YELLOW
      }${message} ${ConsoleColour.RESET}`
    )
  }

  /**
   * The **pauseForQuestion()** method pauses the runtime for a user produced text answer.
   * @returns The user produced text answer.
   * @param question - Any preferred string question.
   */
  public pauseForQuestion(question: string): string {
    return rsync.question(
      `${ConsoleColour.BGRED}${ConsoleColour.BOLD}${question}:${ConsoleColour.RESET} `
    )
  }

  /**
   * The **pauseForYNQuestion()** method pauses the runtime for a user produced y/n answer.
   * @returns **true** when user answer 'y' or 'yes'.
   * @param question - Any preferred string question.
   */
  public pauseForYNQuestion(question = 'Are you sure?'): boolean {
    const ans = this.pauseForQuestion(`${question} [y/n]`)
    return ans.toLowerCase() === 'y' || ans.toLowerCase() === 'yes'
  }

  /**
   * The **pauseForAnyKey()** method pauses the runtime for any user produced keypress.
   * @param text - Any preferred string text.
   */
  public pauseForAnyKey(text = 'Press any key to continue.'): void {
    rsync.keyIn(
      `${ConsoleColour.BGYELLOW}${ConsoleColour.BOLD}${text}${ConsoleColour.RESET}`
    )
  }
}
