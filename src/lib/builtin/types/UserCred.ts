/**
 * @category Built-in
 */
interface AuthorisedBrowser {
  browser: {
    name: string
    version: string
  }
  cpu: {
    architecture: string
  }
  device: {
    model: string
    vendor: string
  }
  fingerPrint: string
  ip: string
  os: {
    name: string
    version: string
  }
}

/**
 * @category Built-in
 */
export interface IUserCred {
  stdID: string
  phone: string
  password: string
  email: string
  dataRefID: string
  safeMode?: boolean
  beta?: string[]
  authorised?: Record<string, AuthorisedBrowser> | {}
  allowedApps?: Record<string, string>
  admin?: boolean
  '2FA'?: {
    base32: string
    otpauthUrl: string
    verified: boolean
  }
}

/**
 * @category Built-in
 */
export type UserCredCollectionType = Record<string, IUserCred>
