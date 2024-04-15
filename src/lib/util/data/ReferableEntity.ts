import type { DataType } from './DataType'
import { FieldDelete } from './FieldDelete'

/**
 * The **ReferableMapEntity<T>()** class
 * encapsulates any {@link DataType} as an identified entity (an entity, which contains an ID and changes can be mutable and push to the database).
 * @category Lib
 */
export class ReferableMapEntity<T extends DataType> {
  /**
   * The **synthesized** property determines whether the object is newly created in script or retrieved from the existing source.<br/><br/>
   *       (in-script created ReferableMapEntity will always be marked as synthesized and will be created when push to the database)
   */
  public synthesized: boolean
  public document: string | undefined
  private content: T
  public saved: Partial<T> = {}
  public changes: Partial<T> = {}
  private alive = true

  constructor(content: T, document?: string) {
    /* Every object that created by constructor (in-code creation will
    be classified as synthesized object) which will trigger the creation process later on*/
    this.synthesized = true
    this.content = content
    this.document = document
  }

  /**
   * The **isEdited()** method determines whether the entity has been edited or not.
   */
  public isEdited(): boolean {
    return (
      Object.keys(this.changes).length > 0 ||
      this.isDeleted() ||
      !this.document ||
      this.synthesized
    )
  }

  /**
   * The **update()** method updates existed field with the provided value.
   * @param field - Field name
   * @param value - Acceptable field value.
   */
  public update<U extends keyof T>(field: U, value: T[U]) {
    if (!(field in this.saved)) {
      this.saved[field] = this.content[field]
    }

    this.content[field] = value
    this.changes[field] = value
    return this
  }

  /**
   * The **set()** method sets the entire entity to the provided value.
   * @param value - Acceptable field value.
   */
  public set(value: T) {
    this.content = value
    this.changes = value
    return this
  }

  /**
   * The **get()** method gets the value of the provided field.
   * @param field - Field name.
   */
  public get<U extends keyof T>(field: U): T[U] {
    return this.content[field]
  }

  /**
   * The **deleteField()** method deletes the provided field from the entity.
   * @param field - Field name.
   */
  public deleteField<U extends keyof T>(field: U): void {
    if (!(field in this.saved)) {
      this.saved[field] = this.content[field]
    }

    this.content[field] = <T[U]>new FieldDelete()
    this.changes[field] = <T[U]>new FieldDelete()
  }

  /**
   * The **delete()** method deletes the entity.
   */
  public delete(): void {
    this.saved = this.getOriginal()
    this.changes = {}
    this.alive = false
  }

  /**
   * The **isDeleted()** method determines whether the entity is deleted or not.
   */
  public isDeleted(): boolean {
    return !this.alive
  }

  /**
   * The **data()** method returns raw data as its original form.
   */
  public data(): T {
    return this.content
  }

  /**
   * The **getOriginal()** method gives the original content of the entity before changes.
   */
  public getOriginal(): T {
    return { ...this.content, ...this.saved }
  }

  /**
   * The **setSynthesized()** method sets the synthesized property.
   * @param syn - value
   */
  public setSynthesized(syn: boolean): void {
    this.synthesized = syn
  }
}
