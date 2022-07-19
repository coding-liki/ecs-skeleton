import Component from './Component'
import EntityContainer from './EntityContainer'

export default class Entity {
  private id: string
  private  components: Component[]

  constructor(id: string, components: Component[]) {
    this.id = id
    this.components = components
  }

  public getComponents = ():Component[] => {
    return this.components;
  }
}
