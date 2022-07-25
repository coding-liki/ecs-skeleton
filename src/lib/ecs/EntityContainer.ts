import { EventManager } from '@coding-liki/event-manager'
import Component from './Component'
import Entity from './Entity'

export default class EntityContainer {
  public static EVENT_MANAGER_NAME = 'ecs-event-manager'

  private components: { [key: string]: Component[] } = {}
  private entityComponents: { [key: string]: Component[] } = {}
  private eventManager: EventManager

  private containerPrefix: string

  public constructor(containerPrefix: string = '') {
    this.containerPrefix = containerPrefix

    this.eventManager = EventManager.instance(
      this.containerPrefix + EntityContainer.EVENT_MANAGER_NAME
    )
  }
  public getContainerPrefix = (): string => {
    return this.containerPrefix
  }

  public getEntityComponents = (id: string): Component[] => {
    return this.entityComponents[id]
  }

  public getComponents = (componentType: Function | string): Component[] => {
    let type: string =
      componentType instanceof Function ? componentType.name : componentType

    return this.components[type]
  }

  public createEntity = (components: Component[]): Entity => {
    let newId: string = this.generatenNewId()

    components.forEach((component: Component) => {
      component.setEntityId(newId)
      this.addComponent(component)
    })

    return new Entity(newId)
  }

  public addEntity = (entity: Entity) => {
    let id: string = entity.getId() ?? this.generatenNewId()
    entity.setId(id)
  }

  public addComponent = (component: Component) => {
    let type: string = component.getType()

    if (!this.components[type]) {
      this.components[type] = []
    }

    if (!this.components[type].includes(component)) {
      this.components[type].push(component)
    }

    if (!this.entityComponents[component.getEntityId()]) {
      this.entityComponents[component.getEntityId()] = []
    }

    if (!this.entityComponents[component.getEntityId()].includes(component)) {
      this.entityComponents[component.getEntityId()].push(component)
    }
  }

  public removeComponent = (component: Component) => {
    let type: string = component.getType()

    if (this.components[type] && this.components[type].includes(component)) {
      let index = this.components[type].indexOf(component)
      if (index > -1) {
        this.components[type].splice(index, 1)
      }
    }
  }

  private generatenNewId = (): string => {
    return Date.now().toString(36)
  }
}
