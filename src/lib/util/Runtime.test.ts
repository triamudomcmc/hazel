import { describe, expect, test } from '@jest/globals'

import { Runtime } from './Runtime'

describe('Runtime', () => {
  describe('Runtime Process ENV Setup', () => {
    test('DEV', () => {
      const devRuntime = new Runtime('DEV')
      expect(process.env.RUNTIME_MODE).toBe('DEV')
    })

    test('PROD', () => {
      const prodRuntime = new Runtime('PROD')
      expect(process.env.RUNTIME_MODE).toBe('PROD')
    })
  })
})
