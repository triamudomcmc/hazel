const operators = ['=', '<', '>']
const allowed = ['=', '==', '<=', '>=']

export const getVersionWeight = (versionNumber: string) => {
  const n = versionNumber.split('.')
  let weight = 0
  n.forEach((e) => {
    weight += parseInt(e)
  })

  return weight
}

export const parseVersion = (version: string) => {
  const firstAr = version.charAt(0)
  const secondAr = version.charAt(1)
  let operator = ''

  if (operators.includes(firstAr)) {
    operator += firstAr
  }
  if (operators.includes(secondAr)) {
    operator += secondAr
  }

  if (!allowed.includes(operator)) {
    return null
  }
  const versionNumber = version.replace(operator, '')

  return {
    op: operator,
    number: versionNumber
  }
}

export const compareWithOp = (a: number, b: number, op: string) => {
  switch (op) {
    case '=':
      return a === b
    case '==':
      return a === b
    case '>=':
      return a >= b
    case '<=':
      return a <= b
    case '>':
      return a > b
    case '<':
      return a < b
    default:
      return false
  }
}
