import EntityContainer from "./EntityContainer";

export default class Component implements ComponentInterface {
  private entityId: string = 'global'

  public setEntityId = (entityId?: string) => {
    this.entityId = entityId ?? ''

    return this;
  }

  public getEntityId = (): string => {
    return this.entityId
  }

  public getType = (): string => {
    return this.constructor.name
  }
}

export interface ComponentInterface {
  setEntityId(entityId?: string): ComponentInterface;

  getEntityId(): string;

  getType(): string;
}
