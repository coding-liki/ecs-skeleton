import Component from './Component'
import Entity from './Entity'

export default class EntityContainer {
  private components: { [key: string]: Component[] } = {}
  private entityComponents: { [key: string]: Component[] } = {}

  public getEntityComponents = (id: string): Component[] => {
    return this.entityComponents[id]
  }

  public getComponents = (componentClass: Function | string): Component[] => {
    let name: string =
      componentClass instanceof Function ? componentClass.name : componentClass

    return this.components[name]
  }

  public createEntity = (components: Component[]): string => {
    let newId: string = this.generatenNewId()

    components.forEach((component: Component) => {
      component.setEntityId(newId)
      this.addComponent(component)
    })
    this.entityComponents[newId] = components

    return newId
  }

  public addEnttity = () => {
    
  }

  public addComponent = (component: Component) => {
    let type: string = component.getType()

    if (!this.components[type]) {
      this.components[type] = []
    }

    if (!this.components[type].includes(component)) {
      this.components[type].push(component)
    }
  }

  private generatenNewId = (): string => {
    return Date.now().toString(36)
  }
}
