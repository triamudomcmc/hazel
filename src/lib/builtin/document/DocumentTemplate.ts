import fs from 'fs'

import { Debugger } from '../../util/debugger/Debugger'

/**
 * @category Built-in
 */
export class DocumentTemplate {
  public template: string

  constructor(path: string) {
    new Debugger('IOUnit').info(`load document template from ${path}`)
    this.template = fs.readFileSync(`${path}`, 'utf8')
  }
}
