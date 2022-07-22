import Component from './Component'
import EntityContainer from './EntityContainer'

export default class Entity {
  private id?: string
  private components: Component[]

  constructor(components: Component[], id?: string) {
    this.components = components
    this.id = id
  }

  public getComponents = (): Component[] => {
    return this.components
  }

  public getId = (): string | undefined => {
    return this.id
  }

  public setId = (id: string) => {
    this.id = id
  }
}
