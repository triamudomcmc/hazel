const START_HEADER = '/*------Hazel Typescript Header-------\n'
const END_HEADER = '-------------Header END--------------*/'
const START_PROPERTIES = '--------------PROPERTIES--------------\n'
const END_PROPERTIES = '------------END-PROPERTIES------------'
const parseTag = (raw: string, startMarker: string, endMarker: string) => {
  const headerText = raw.split(endMarker, 1)
  if (!headerText[0]) return ''
  const hc = headerText[0].split(startMarker, 2)
  if (!hc[1]) return ''
  return hc[1]
}

interface Properties {
  env_file: string
  skip_yes_no: boolean
  version: string
}
const parseProperties = (raw: string): Properties => {
  const props: Properties = {
    env_file: '',
    skip_yes_no: false,
    version: 'any'
  }

  const propsStr = raw.split('\n')

  propsStr.forEach((e) => {
    const splitted = e.split(/=(.*)/s)

    if (!splitted[0]) return
    const key = splitted[0].trim()

    if (key in props) {
      if (!splitted[1]) return
      let pv: string | boolean
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const value: any = props[key]
      if (typeof value === 'string') {
        const matched = splitted[1].match(/"(.*?)"/)
        if (matched && matched[1]) {
          pv = matched[1]
        } else if (splitted[1].trim() === '""') {
          pv = ''
        }
      } else if (typeof value === 'boolean') {
        const m = splitted[1].trim()
        if (m === 'true') {
          pv = true
        } else if (m === 'false') {
          pv = false
        } else {
          return
        }
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      props[key] = pv
    }
  })

  return props
}
export const parseHeader = (script: string): Properties | null => {
  if (!script.includes(START_HEADER)) return null
  if (!script.includes(END_HEADER)) return null

  const headerContent = parseTag(script, START_HEADER, END_HEADER)
  if (!headerContent) return null

  const propertiesRaw = parseTag(
    headerContent,
    START_PROPERTIES,
    END_PROPERTIES
  )

  const property = parseProperties(propertiesRaw)

  return property
}
