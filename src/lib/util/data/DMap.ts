import * as crypto from 'crypto'

/**
 * The **DMap<K, V>()** class
 * encapsulates any object and provides utility method.
 * @category Lib
 */
export class DMap<K extends string, V> {
  protected content: Record<K, V>

  /**
   * The **DMap<K, V>()** class
   * encapsulates any object and provides utility method.
   */
  constructor(content: Record<K, V> | [K, V][] | Record<K, V>[]) {
    if (Array.isArray(content)) {
      const rec: Record<K, V> = {} as Record<K, V>
      content.forEach((s) => {
        let k: K
        let v: V
        if (Array.isArray(s)) {
          ;[k, v] = s
        } else {
          k = <K>Object.keys(s)[0]
          v = <V>Object.values(s)[0]
        }

        rec[k] = v
      })
      this.content = rec
    } else {
      this.content = content
    }
  }

  /**
   * The **size()** method gives record's size.
   */
  public size(): number {
    return this.keys().length
  }

  /**
   * The **keys()** method gives record's key array.
   */
  public keys(): K[] {
    return <K[]>Object.keys(this.content)
  }

  /**
   * The **values()** method gives record's values array.
   */
  public values(): V[] {
    return <V[]>Object.values(this.content)
  }

  /**
   * The **iterable()** method formats record to its iterable form.
   */
  public iterable(): [K, V][] {
    return this.keys().map((k) => [k, this.content[k]])
  }

  /**
   * The **map()** method creates a new array populated with the results of calling a provided function on every element in the calling array.
   * @param c - Function that is called for every element of arr. Each time callbackFn executes, the returned value is added to newArray.
   */
  public map<R>(
    c: (key: K, value: V, index: number, obj: Record<K, V>) => R
  ): R[] {
    return this.keys().map((k, i) =>
      c(k, this.content[k], i, <Record<K, V>>{ [k]: this.content[k] })
    )
  }

  /**
   * The sort() method sorts the elements of an array in place and returns the sorted array. The default sort order is ascending, built upon converting the elements into strings, then comparing their sequences of UTF-16 code units values.
   * @param c - Specifies a function that defines the sort order. If omitted, the array elements are converted to strings, then sorted according to each character's Unicode code point value.
   */
  public sort(c: (a: [K, V], b: [K, V]) => number): DMap<K, V> {
    return new DMap<K, V>(this.iterable().sort(c))
  }

  /**
   * The **iterateSync()** method synchronously iterates through record's key and value.
   * @param c - Function that is called for every element of arr. Each time callbackFn executes.
   */
  public iterateSync(
    c: (key: K, value: V, index: number, obj: Record<K, V>) => void
  ): void {
    this.keys().forEach((k, i) => {
      c(k, this.content[k], i, <Record<K, V>>{ [k]: this.content[k] })
    })
  }

  /**
   * The **iterate()** method iterates through record's key and value.
   * @param c - Function that is called for every element of arr. Each time callbackFn executes.
   */
  public async iterate(
    c: (key: K, value: V, index: number, obj: Record<K, V>) => Promise<void>
  ): Promise<void> {
    let i = 0
    // eslint-disable-next-line no-restricted-syntax
    for (const [k, v] of this.iterable()) {
      // eslint-disable-next-line no-await-in-loop
      await c(k, v, i, <Record<K, V>>{ [k]: this.content[k] })
      i += 1
    }
  }

  /**
   * The **hasKey()** method checks if the record contained a given key.
   * @param c - Key that being searched.
   */
  public hasKey(c: K): boolean {
    return this.keys().includes(c)
  }

  /**
   * The **filter()** method filters records' key, value, which the matching function returned true.
   * @param matcher - Matching function matches records' under provided condition.
   */
  public filter(matcher: (k: K, v: V) => boolean): DMap<K, V> {
    return new DMap<K, V>(this.iterable().filter(([k, v]) => matcher(k, v)))
  }

  /**
   * The **groupBy()** method groups records by located values using keyLocator.
   * @param keyLocator - Key locator function finds the value that will be an object key.
   */
  public groupBy<G extends string>(
    keyLocator: (v: V) => G
  ): DMap<G, Record<K, V>[]> {
    const grouped: Record<G, Record<K, V>[]> = {} as Record<G, Record<K, V>[]>
    this.iterateSync((k, v, _, obj) => {
      const gKey = keyLocator(v)
      if (gKey in grouped) {
        grouped[gKey].push(obj)
        return
      }
      grouped[gKey] = [obj]
    })
    return new DMap(grouped)
  }

  /**
   * The **findKeys()** method finds records' key, which the matching function returned true.
   * @param matcher - Matching function matches records' value under provided condition.
   */
  public findKeys(matcher: (v: V) => boolean): K[] {
    const matchedKey: K[] = []
    this.keys().forEach((k) => {
      if (matcher(this.content[k])) matchedKey.push(k)
    })
    return matchedKey
  }

  /**
   * The **findValues()** method finds records' value, which the matching function returned true.
   * @param matcher - Matching function matches records' value under provided condition.
   */
  public findValues(matcher: (v: V) => boolean): V[] {
    const matchedVal: V[] = []
    this.values().forEach((v) => {
      if (matcher(v)) matchedVal.push(v)
    })
    return matchedVal
  }

  /**
   * The **hasValue()** method checks if the record contained a given value.
   * @param c - Value that being searched.
   */
  public hasValue(c: V): boolean {
    return this.values().includes(c)
  }

  /**
   * The **keyMatch()** method finds records' key, which matched with elements in the given array.
   * @param comparable - Provided keys array.
   */
  public keyMatch(comparable: string[]): K[] {
    const match: K[] = []
    this.keys().forEach((k) => {
      if (comparable.includes(k)) match.push(k)
    })
    return match
  }

  /**
   * The **keyDiff()** method finds records' key, which different from elements in the given array.
   * @param comparable - Provided keys array.
   */
  public keyDiff(comparable: string[]): K[] {
    const diff: K[] = []
    this.keys().forEach((k) => {
      if (!comparable.includes(k)) diff.push(k)
    })
    return diff
  }

  /**
   * The **get()** method accesses the value of the given key.
   * @param key - Provided key.
   */
  public get(key: K): V | undefined {
    return this.content[key]
  }

  /**
   * The **set()** method set **new** key to the map.
   * @param key - Provided key.
   * @param value - Provided value.
   */
  public set(key: K, value: V): void {
    // if (key in this.content) {
    //   throw Error(
    //     `${ConsoleColour.BGRED}${ConsoleColour.BOLD}DMap.set() must be used to set new key to the map.${ConsoleColour.RESET}`
    //   )
    // }
    this.content[key] = value
    return
  }

  /**
   * The **insert()** method insert new value to the map and assign temporary uuid.
   * For the document-based database, an inserted key-value will be created after changes are pushed to the server.
   * @param value - Provided value.
   */
  public insert(value: V): void {
    const uuid = crypto.randomUUID()
    this.set(`temp-${uuid}` as K, value)
  }

  /**
   * The **getRecord()** method gives the {@link Record} of the DMap.
   */
  public getRecord(): Record<K, V> {
    return this.content
  }

  /**
   * The **isLive()** method determines the state of the DMap.
   */
  public isLive() {
    return false
  }

  public remove(key: K) {
    const del = this.content[key]
    delete this.content[key]
    return del
  }
}
