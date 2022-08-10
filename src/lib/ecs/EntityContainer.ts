import { EventManager } from '@coding-liki/event-manager'
import { uuid } from 'uuidv4';
import Component, { ComponentInterface } from './Component'
import Entity from './Entity'
import { AddComponentEvent, RemoveComponentEvent } from './events'

type ComponentOrAny = Component|any;

export default class EntityContainer {
  public static EVENT_MANAGER_NAME = 'ecs-event-manager'

  private components: { [key: string]: ComponentInterface[] } = {}
  private entityComponents: { [key: string]: ComponentInterface [] } = {}
  private eventManager: EventManager
  
  private containerPrefix: string

  public constructor(containerPrefix: string = '') {
    this.containerPrefix = containerPrefix

    this.eventManager = EventManager.instance(
      this.containerPrefix + EntityContainer.EVENT_MANAGER_NAME
    )
  }
  
  public getEventManager = (): EventManager => {
    return this.eventManager;
  }

  public getContainerPrefix = (): string => {
    return this.containerPrefix
  }

  public getEntityComponents = <ComponentType extends ComponentInterface = Component>(id: string, componentType: Function = Component): ComponentType[] => {
    return this.entityComponents[id].filter((component: ComponentInterface) => {
      return component instanceof componentType;
    });
  }

  public getComponents = <ComponentType extends ComponentInterface = Component>(componentType: Function = Component): ComponentType[] => {
    return this.components[componentType.name] ? this.components[componentType.name] : [];
  }

  public createEntity = (components: ComponentInterface[]): Entity => {
    let newId: string = this.generatenNewId()

    components.forEach((component: ComponentInterface) => {
      component.setEntityId(newId)
      this.addComponent(component)
    })

    return new Entity(newId)
  }

  public addEntity = (entity: Entity) => {
    let id: string = entity.getId() ?? this.generatenNewId()
    entity.setId(id)
  }

  public addComponent = (component: ComponentInterface) => {
    let type: string = component.getType()

    if (!this.components[type]) {
      this.components[type] = []
    }

    if (!this.components[type].includes(component)) {
      this.components[type].push(component)
      this.eventManager.dispatch(new AddComponentEvent(component));
    }

    if (!this.entityComponents[component.getEntityId()]) {
      this.entityComponents[component.getEntityId()] = []
    }

    if (!this.entityComponents[component.getEntityId()].includes(component)) {
      this.entityComponents[component.getEntityId()].push(component)
    }
  }

  public removeComponent = (component: ComponentInterface) => {
    let type: string = component.getType()

    if (this.components[type] && this.components[type].includes(component)) {
      let index = this.components[type].indexOf(component)
      if (index > -1) {
        this.components[type].splice(index, 1);
        this.eventManager.dispatch(new RemoveComponentEvent(component));
      }
    }
  }

  private generatenNewId = (): string => {
    return uuid()
  }
}
