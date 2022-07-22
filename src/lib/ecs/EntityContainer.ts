import Component from './Component'
import Entity from './Entity'

export default class EntityContainer {
  private components: { [key: string]: Component[] } = {}
  private entityComponents: { [key: string]: Component[] } = {}

  public getEntityComponents = (id: string): Component[] => {
    return this.entityComponents[id]
  }

  public getComponents = (componentType: Function | string): Component[] => {
    let name: string =
      componentType instanceof Function ? componentType.name : componentType

    return this.components[name]
  }

  public createEntity = (components: Component[]): Entity => {
    let newId: string = this.generatenNewId()

    components.forEach((component: Component) => {
      component.setEntityId(newId)
      this.addComponent(component)
    })
    this.entityComponents[newId] = components

    return new Entity(components, newId)
  }

  public addEnttity = (entity: Entity) => {
    if (entity.getId() === undefined) {
      entity.setId(this.generatenNewId())
    }

    let id: string | undefined = entity.getId()

    if(typeof id == 'string'){
    entity.getComponents().forEach((component: Component) => {
      if (typeof id === 'string') {
        component.setEntityId(id)
        this.addComponent(component)
      }
    })

    this.entityComponents[id] = entity.getComponents()
    }
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
