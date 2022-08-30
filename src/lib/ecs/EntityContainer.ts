import { EventManager } from '@coding-liki/event-manager'
import { nanoid } from 'nanoid';
import Component, { ComponentInterface } from './Component'
import Entity from './Entity'
import { AddComponentEvent, RemoveComponentEvent } from './events'

type ComponentOrAny = Component | any;

export default class EntityContainer {
  public id: string;
  public static EVENT_MANAGER_NAME = 'ecs-event-manager'

  private components: { [key: string]: ComponentInterface[] } = {}
  private entityComponents: { [key: string]: ComponentInterface[] } = {}
  private taggedEntities: { [key: string]: Entity[] } = {}

  private eventManager: EventManager

  private containerPrefix: string

  public constructor(containerPrefix: string = '') {
    this.id = this.generatenNewId();
    this.containerPrefix = containerPrefix

    this.eventManager = EventManager.instance(
      this.containerPrefix + EntityContainer.EVENT_MANAGER_NAME
    )
  }

  public getEventManager(): EventManager {
    return this.eventManager;
  }

  public getContainerPrefix(): string {
    return this.containerPrefix
  }

  public getComponentsByEntityId<ComponentType extends ComponentInterface = Component>(id?: string, componentType: Function = Component): ComponentType[] {
    if (!id) {
      return [];
    }

    return this.entityComponents[id].filter((component: ComponentInterface) => {
      return component instanceof componentType;
    }) as ComponentType[];
  }

  public getComponentByEntityId<ComponentType extends ComponentInterface = Component>(id?: string, componentType: Function = Component): ComponentType | undefined {
    return this.getComponentsByEntityId<ComponentType>(id, componentType)[0];
  }

  public getEntityComponents<ComponentType extends ComponentInterface = Component>(entity: Entity, componentType: Function = Component): ComponentType[] {
    return this.getComponentsByEntityId<ComponentType>(entity.getId(), componentType);
  }

  public getEntityComponent<ComponentType extends ComponentInterface = Component>(entity: Entity, componentType: Function = Component): ComponentType | undefined {
    let components = this.getComponentsByEntityId<ComponentType>(entity.getId(), componentType);
    return components[0];
  }

  public getComponents<ComponentType extends ComponentInterface = Component>(componentType: Function = Component): ComponentType[] {
    return (this.components[componentType.name] ? this.components[componentType.name] : []) as ComponentType[];
  }

  public createEntity(components: ComponentInterface[], tags: string[] = []): Entity {
    let newId: string = this.generatenNewId()

    components.forEach((component: ComponentInterface) => {
      component.setEntityId(newId)
      this.addComponent(component)
    })

    let entity = new Entity(newId, tags);
    this.addEntity(entity);

    return entity;
  }

  public addEntity(entity: Entity) {
    let id: string = entity.getId() ?? this.generatenNewId();

    entity.getTags()?.forEach((tag: string) => {
      if (!this.taggedEntities[tag]) {
        this.taggedEntities[tag] = [];
      }
      if (!this.taggedEntities[tag].includes(entity)) {
        this.taggedEntities[tag].push(entity)
      }
    });


    entity.setId(id)
  }

  public addComponent(component: ComponentInterface) {
    let type: string = component.getType()

    if (!this.components[type]) {
      this.components[type] = []
    }

    if (!this.components[type].includes(component)) {
      this.components[type].push(component)
      setTimeout(() => this.eventManager.dispatch(new AddComponentEvent(component)));
    }

    if (!this.entityComponents[component.getEntityId()]) {
      this.entityComponents[component.getEntityId()] = []
    }

    if (!this.entityComponents[component.getEntityId()].includes(component)) {
      this.entityComponents[component.getEntityId()].push(component)
    }
  }

  public removeComponent(component: ComponentInterface) {
    let type: string = component.getType()

    if (this.components[type] && this.components[type].includes(component)) {
      let index = this.components[type].indexOf(component)
      if (index > -1) {
        this.components[type].splice(index, 1);
        this.eventManager.dispatch(new RemoveComponentEvent(component));
      }
    }
  }

  public removeEntity(entity: Entity) {
    if (!entity.getId()) {
      return;
    }

    entity.getTags()?.forEach(tag => {
      let index = this.taggedEntities[tag].indexOf(entity)
      if (index > -1) {
        this.taggedEntities[tag].splice(index, 1);
      }
    });

    let components = this.getComponentsByEntityId(entity.getId());
    components.forEach(component => {
      this.removeComponent(component);
    });

  }
  // public getEntityById(id: string): Entity | undefined {

  // }
  public getEntitiesByTag(tag: string): Entity[] {
    return this.taggedEntities[tag] ? this.taggedEntities[tag] : [];
  }

  public getEntityByTag(tag: string): Entity | undefined {
    return this.getEntitiesByTag(tag)[0];
  }

  public removeEntitiesWithTag(tag: string): void {
    this.getEntitiesByTag(tag).forEach(canvas => {
      this.removeEntity(canvas)
    })
  }
  private generatenNewId(): string {
    return nanoid(48)
  }
}
