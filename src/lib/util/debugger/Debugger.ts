import type { Ora } from 'ora'
import ora from 'ora'
import rsync from 'readline-sync'

import { NumberUtil } from '../Number'
import { ConsoleColour } from './Colour'

export class Debugger {
  private readonly unit: string

  constructor(unit: string) {
    this.unit = unit
  }

  private static debugTimestamp(): string {
    const date = new Date()

    return `${NumberUtil.zeroPad(date.getHours())}:${NumberUtil.zeroPad(
      date.getMinutes()
    )}:${NumberUtil.zeroPad(date.getSeconds())}`
  }

  public info(context: string): void {
    console.info(
      `${Debugger.debugTimestamp()} | ${this.unit} | ${
        ConsoleColour.GRAY
      }${context} ${ConsoleColour.RESET}`
    )
  }

  public loadingInfo(loadingText: string): Ora {
    const spinner = ora()
    spinner.prefixText = `${Debugger.debugTimestamp()} | ${this.unit} | ${
      ConsoleColour.GRAY
    }`
    spinner.start(loadingText + '\n')
    spinner.text = loadingText
    return spinner
  }

  public dump(data: any): void {
    console.log(
      `${Debugger.debugTimestamp()} | ${this.unit} | ${ConsoleColour.GRAY}`,
      data,
      ConsoleColour.RESET
    )
  }

  public table(data: any): void {
    console.log(
      `${Debugger.debugTimestamp()} | ${this.unit} | ${
        ConsoleColour.GRAY
      } vvv TABLE vvv ${ConsoleColour.RESET}`
    )
    console.table(data)
  }

  public err(context: any): void {
    console.error(
      `${Debugger.debugTimestamp()} | ${this.unit} | ${
        ConsoleColour.RED
      }${context} ${ConsoleColour.RESET}`
    )
  }

  public warn(context: string): void {
    console.warn(
      `${Debugger.debugTimestamp()} | ${this.unit} | ${
        ConsoleColour.YELLOW
      }${context} ${ConsoleColour.RESET}`
    )
  }

  public pauseForQuestion(question: string): string {
    return rsync.question(
      `${ConsoleColour.BGRED}${ConsoleColour.BOLD}${question}:${ConsoleColour.RESET} `
    )
  }

  public pauseForYNQuestion(question = 'Are you sure?'): boolean {
    const ans = this.pauseForQuestion(`${question} [y/n]`)
    return ans.toLowerCase() === 'y' || ans.toLowerCase() === 'yes'
  }

  public pauseForAnyKey(text = 'Press any key to continue.'): void {
    rsync.keyIn(
      `${ConsoleColour.BGYELLOW}${ConsoleColour.BOLD}${text}${ConsoleColour.RESET}`
    )
  }
}
