import dpath from 'path'

import { DMap } from '../../util/data/DMap'
import { IDUtil } from '../data/ID/IDUtil'
import type { MainClubIDType } from '../types/ClubID'
import type { EvaluateType, IEvaluateResult } from '../types/Evaluate'
import type { IUserData } from '../types/UserData'
import type { DocumentTemplate } from './DocumentTemplate'

interface IClubMemberData {
  all: DMap<string, IEvaluateResult>
  passed: EvaluateType[] | undefined
  failed: EvaluateType[] | undefined
  break: EvaluateType[] | undefined
  resign: EvaluateType[] | undefined
}

const pdf = require('pdf-node')

/**
 * @category Built-in
 */
export class EvaluationDocument {
  private readonly clubID: MainClubIDType

  private clubMemberData: IClubMemberData

  private docInfo

  private userMap: DMap<string, IUserData>

  constructor(
    clubID: MainClubIDType,
    docInfo: { semester: string; year: string },
    clubMemberData: IClubMemberData,
    uMap: DMap<string, IUserData>
  ) {
    this.clubID = clubID
    this.clubMemberData = clubMemberData
    this.docInfo = docInfo
    this.userMap = uMap
  }

  protected createDocumentHeading() {
    return {
      club: IDUtil.translateToMainClubName(this.clubID),
      clubId: IDUtil.applyOverriddenLayer(this.clubID),
      sem: this.docInfo.semester,
      year: this.docInfo.year,
      count: this.clubMemberData.all.size(),
      pass: (this.clubMemberData.passed?.length || 0).toString(),
      failed: (this.clubMemberData.failed?.length || 0).toString(),
      exc: (
        (this.clubMemberData.break?.length || 0) +
        (this.clubMemberData.resign?.length || 0)
      ).toString()
    }
  }

  protected createSortedDetailedList(memberData: EvaluateType[]): {
    c: string
    name: string
    grade: string
    room: string
    e: string
  }[] {
    return new DMap(memberData)
      .map((k, v) => {
        const userData = this.userMap.get(k)
        if (!userData) throw Error(`missing user id:${k}`)
        return {
          name: `${userData.title}${userData.firstname} ${userData.lastname}`,
          grade: parseInt(userData.level, 10),
          room: parseInt(userData.room, 10),
          e:
            // eslint-disable-next-line no-nested-ternary
            v.action === 'break'
              ? 'ลาพัก'
              : v.action === 'resign'
              ? 'ลาออก'
              : ''
        }
      })
      .sort((a, b) => a.grade - b.grade || a.room - b.room)
      .map((d, i) => {
        return {
          c: (i + 1).toString(),
          name: d.name,
          grade: `ม.${d.grade}`,
          room: d.room.toString(),
          e: d.e
        }
      })
  }

  private fillBlank(
    d: {
      c: string
      name: string
      grade: string
      room: string
      e: string
    }[]
  ) {
    if (d.length === 0) {
      return [
        {
          c: '',
          name: '',
          grade: '',
          room: '',
          e: ''
        }
      ]
    }
    return d
  }

  private sliceToPrintableChunk(d: any[], f = 15) {
    function chunk(arr: any[], c: number) {
      const chunks = []
      let i = 0
      const n = arr.length

      while (i < n) {
        chunks.push(arr.slice(i, (i += c)))
      }

      return chunks
    }

    let sliced = [d]
    if (d.length > f) {
      const firstChunk = d.slice(0, f)
      const rest = chunk(d.slice(f, d.length), 27)
      sliced = [firstChunk, ...rest]
    }

    return sliced
  }

  public async generate(docTemplate: DocumentTemplate, fileName: string) {
    const heading = this.createDocumentHeading()
    let failed = this.clubMemberData.failed
      ? this.createSortedDetailedList(this.clubMemberData.failed)
      : []

    let exc =
      this.clubMemberData.resign || this.clubMemberData.break
        ? this.createSortedDetailedList([
            ...(this.clubMemberData.resign || []),
            ...(this.clubMemberData.break || [])
          ])
        : []

    failed = this.fillBlank(failed)
    exc = this.fillBlank(exc)

    const slicedExc = this.sliceToPrintableChunk(exc, 6)
    let excd: any[][]
    if (slicedExc.length > 1) {
      excd = slicedExc.slice(0, slicedExc.length - 1)
    } else {
      excd = [slicedExc[0] || []]
    }

    const documentProps = {
      html: docTemplate.template,
      data: {
        general: heading,
        failed: this.sliceToPrintableChunk(failed),
        excdata: slicedExc.length > 1 ? excd : [],
        lastTable:
          slicedExc.length > 1 ? [slicedExc[slicedExc.length - 1]] : excd
      },
      path: dpath.join('./out/evaluate/', `${fileName}.pdf`),
      type: 'pdf'
    }

    const options = {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm',
      footer: {
        height: '28mm'
      }
    }

    await pdf(documentProps, options)
  }
}
