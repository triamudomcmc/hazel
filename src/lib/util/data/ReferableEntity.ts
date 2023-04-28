import type { DataType } from '@lib'

import { FieldDelete } from './FieldDelete'

export class ReferableMapEntity<T extends DataType> {
  public document: string | undefined
  private content: T
  public saved: Partial<T> = {}
  public changes: Partial<T> = {}
  private alive = true

  constructor(content: T, document?: string) {
    this.content = content
    this.document = document
  }

  public isEdited(): boolean {
    return (
      Object.keys(this.changes).length > 0 || this.isDeleted() || !this.document
    )
  }

  public update<U extends keyof T>(field: U, value: T[U]) {
    if (!(field in this.saved)) {
      this.saved[field] = this.content[field]
    }

    this.content[field] = value
    this.changes[field] = value
    return this
  }

  public get<U extends keyof T>(field: U): T[U] {
    return this.content[field]
  }

  public deleteField<U extends keyof T>(field: U): void {
    if (!(field in this.saved)) {
      this.saved[field] = this.content[field]
    }

    this.content[field] = <T[U]>new FieldDelete()
    this.changes[field] = <T[U]>new FieldDelete()
  }

  public delete(): void {
    this.saved = this.getOriginal()
    this.changes = {}
    this.alive = false
  }

  public isDeleted(): boolean {
    return !this.alive
  }

  public data(): T {
    return this.content
  }

  public getOriginal(): T {
    return { ...this.content, ...this.saved }
  }
}
