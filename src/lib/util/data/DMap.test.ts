import { describe, expect, test } from '@jest/globals'

import { DMap } from './DMap'

type SampleData = {
  name: string
  count: number
  sleep: boolean
}

const standardData: Record<string, SampleData> = {
  first: { name: 'first', count: 1, sleep: false },
  second: { name: 'first', count: 0, sleep: false },
  third: { name: 'first', count: 2, sleep: true }
}

const dataType1 = standardData

const dataType2: Record<string, SampleData>[] = [
  { first: { name: 'first', count: 1, sleep: false } },
  { second: { name: 'first', count: 0, sleep: false } },
  { third: { name: 'first', count: 2, sleep: true } }
]

const dataType3: [string, SampleData][] = [
  ['first', { name: 'first', count: 1, sleep: false }],
  ['second', { name: 'first', count: 0, sleep: false }],
  ['third', { name: 'first', count: 2, sleep: true }]
]

const expectedKVIO = [
  {
    k: 'first',
    v: { name: 'first', count: 1, sleep: false },
    i: 0,
    o: { first: { name: 'first', count: 1, sleep: false } }
  },
  {
    k: 'second',
    v: { name: 'first', count: 0, sleep: false },
    i: 1,
    o: { second: { name: 'first', count: 0, sleep: false } }
  },
  {
    k: 'third',
    v: { name: 'first', count: 2, sleep: true },
    i: 2,
    o: { third: { name: 'first', count: 2, sleep: true } }
  }
]

describe('DMap', () => {
  test('constructor', () => {
    const dMapType1 = new DMap(dataType1)
    const dMapType2 = new DMap(dataType2)
    const dMapType3 = new DMap(dataType3)

    // Size testing
    expect(dMapType1.size()).toBe(3)
    expect(dMapType2.size()).toBe(3)
    expect(dMapType3.size()).toBe(3)

    // Data Record Check
    expect(dMapType1.getRecord()).toMatchObject(standardData)
    expect(dMapType2.getRecord()).toMatchObject(standardData)
    expect(dMapType3.getRecord()).toMatchObject(standardData)
  })

  const testSubject = new DMap(standardData)

  test('method::size', () => {
    expect(testSubject.size()).toBe(3)
  })

  test('method::keys', () => {
    expect(testSubject.keys()).toEqual(['first', 'second', 'third'])
  })

  test('method::values', () => {
    expect(testSubject.values()).toMatchObject([
      { name: 'first', count: 1, sleep: false },
      { name: 'first', count: 0, sleep: false },
      { name: 'first', count: 2, sleep: true }
    ])
  })

  test('method::iterable', () => {
    expect(testSubject.iterable()).toEqual([
      ['first', { name: 'first', count: 1, sleep: false }],
      ['second', { name: 'first', count: 0, sleep: false }],
      ['third', { name: 'first', count: 2, sleep: true }]
    ])
  })

  test('method::map', () => {
    const mapResult = testSubject.map((k, v, i, o) => {
      return { k, v, i, o }
    })

    expect(mapResult).toMatchObject(expectedKVIO)
  })

  test('method::sort', () => {
    const sorted = testSubject.sort((a, b) => a[1].count - b[1].count)
    expect(sorted.keys()).toStrictEqual(['second', 'first', 'third'])
  })

  test('method::iterateSync', () => {
    testSubject.iterateSync((k, v, i, o) => {
      const ref = expectedKVIO[i]
      if (!ref) {
        throw 'error'
      }

      expect({ k, v, i, o }).toMatchObject(ref)
    })
  })

  test('method::iterate', async () => {
    const KVIOList: any[] = []
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

    await testSubject.iterate(async (k, v, i, o) => {
      if (i === 1) {
        await delay(1000)
      }

      KVIOList.push({ k, v, i, o })
    })

    expect(KVIOList).toEqual(expectedKVIO)
  })

  test('method::hasKey', () => {
    expect(testSubject.hasKey('first')).toBe(true)
    expect(testSubject.hasKey('firste')).toBe(false)
  })

  test('method::filter', () => {
    const filtered = testSubject.filter((k, v) => !v.sleep)

    expect(filtered.getRecord()).toMatchObject({
      first: { name: 'first', count: 1, sleep: false },
      second: { name: 'first', count: 0, sleep: false }
    })
  })

  test('method::groupBy', () => {
    const grouped = testSubject.groupBy((v) => (v.sleep ? 'yes' : 'no'))

    expect(grouped.keys()).toEqual(expect.arrayContaining(['yes', 'no']))

    expect(grouped.get('yes')).toMatchObject([
      { third: { name: 'first', count: 2, sleep: true } }
    ])
    expect(grouped.get('no')).toMatchObject([
      { first: { name: 'first', count: 1, sleep: false } },
      { second: { name: 'first', count: 0, sleep: false } }
    ])
  })

  test('method::findKeys', () => {
    const keys = testSubject.findKeys((v) => !v.sleep)
    expect(keys).toEqual(expect.arrayContaining(['first', 'second']))
    const keys2 = testSubject.findKeys((v) => v.sleep)
    expect(keys2).toEqual(expect.arrayContaining(['third']))
  })

  test('method::findValues', () => {
    const vals = testSubject.findValues((v) => !v.sleep)
    expect(vals).toMatchObject([
      { name: 'first', count: 1, sleep: false },
      { name: 'first', count: 0, sleep: false }
    ])
    const vals2 = testSubject.findValues((v) => v.sleep)
    expect(vals2).toMatchObject([{ name: 'first', count: 2, sleep: true }])
  })

  test('method::hasValue', () => {
    expect(
      testSubject.hasValue({ name: 'first', count: 1, sleep: false })
    ).toBe(true)

    expect(
      testSubject.hasValue({ count: 1, name: 'first', sleep: false })
    ).toBe(true)
  })

  test('method::keyMatch', () => {
    const matched = testSubject.keyMatch(['first', 'third'])
    expect(matched).toEqual(expect.arrayContaining(['first', 'third']))
  })

  test('method::keyDiff', () => {
    const diff = testSubject.keyDiff(['first', 'third'])
    expect(diff).toEqual(expect.arrayContaining(['second']))

    const diff2 = testSubject.keyDiff([])
    expect(diff2).toEqual(expect.arrayContaining(['first', 'second', 'third']))
  })

  test('method::get', () => {
    expect(testSubject.get('first')).toMatchObject({
      name: 'first',
      count: 1,
      sleep: false
    })
  })

  test('method::set', () => {
    const mutableTestSubject = new DMap(standardData)
    const testSetData = {
      name: 'test-set',
      count: 3,
      sleep: false
    }
    mutableTestSubject.set('newKey', testSetData)

    expect(mutableTestSubject.keys()).toContain('newKey')
    expect(mutableTestSubject.size()).toBe(4)
    expect(mutableTestSubject.get('newKey')).toMatchObject(testSetData)
  })

  test('method::insert', () => {
    const mutableTestSubject = new DMap(standardData)
    const testInsertData = {
      name: 'test-insert',
      count: 4,
      sleep: true
    }
    const inserted_key = mutableTestSubject.insert(testInsertData)

    expect(mutableTestSubject.size()).toBe(4)
    expect(mutableTestSubject.get(inserted_key)).toMatchObject(testInsertData)
  })

  test('method::getRecord', () => {
    expect(testSubject.getRecord()).toMatchObject(standardData)
  })

  test('method::isLive', () => {
    expect(testSubject.isLive()).toBe(false)
  })

  test('method::remove', () => {
    const mutableTestSubject = new DMap(standardData)
    mutableTestSubject.remove('first')
    expect(mutableTestSubject.getRecord()).toMatchObject({
      second: { name: 'first', count: 0, sleep: false },
      third: { name: 'first', count: 2, sleep: true }
    })

    mutableTestSubject.remove('second')
    expect(mutableTestSubject.getRecord()).toMatchObject({
      third: { name: 'first', count: 2, sleep: true }
    })
  })
})
