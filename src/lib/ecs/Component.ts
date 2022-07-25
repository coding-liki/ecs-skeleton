export default class Component {
  private entityId: string = ''

  public setEntityId = (entityId?: string) => {
    this.entityId = entityId ?? ''
  }

  public getEntityId = (): string => {
    return this.entityId
  }

  public getType = (): string => {
    return this.constructor.name
  }
}
