export default class Entity {
  private id?: string

  constructor(id?: string) {
    this.id = id
  }

  public getId = (): string | undefined => {
    return this.id
  }

  public setId = (id: string) => {
    this.id = id
  }
}
