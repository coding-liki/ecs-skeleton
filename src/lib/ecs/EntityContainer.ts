import {EventManager} from '@coding-liki/event-manager'
import Component, {ComponentInterface} from './Component'
import Entity from './Entity'
import {AddComponentEvent, RemoveComponentEvent} from './events'

type ComponentOrAny = Component | any;

export interface Class<T> {
    new(...args: any[]): T;
}

function cast<T>(TheClass: Class<T>, obj: any): T {
    if (!(obj instanceof TheClass)) {
        throw new Error(`Not an instance of ${TheClass.name}: ${obj}`)
    }
    return obj;
}


export default class EntityContainer {
    public static EVENT_MANAGER_NAME = 'ecs-event-manager'
    public id: string;

    private lastEntityId = 0;
    private components: { [key: string]: ComponentInterface[] } = {};
    private entityComponents: { [key: string]: ComponentInterface[] } = {};
    private taggedEntities: { [key: string]: Entity[] } = {};

    private readonly eventManager: EventManager;

    public constructor(private containerPrefix: string = '') {
        this.id = this.generateNewId();

        this.eventManager = EventManager.instance(
            this.containerPrefix + EntityContainer.EVENT_MANAGER_NAME
        )
    }

    public getEventManager = (): EventManager => this.eventManager;
    public getContainerPrefix = (): string => this.containerPrefix;

    public getComponentsByEntityId = <ComponentType>(id: string, componentType: Class<ComponentType>): ComponentType[] => {
        if (id === "") {
            return [];
        }

        return this.entityComponents[id].filter(
            _ => _ instanceof componentType
        ) as ComponentType[];
    }

    public getComponentByEntityId = <ComponentType>(id: string, componentType: Class<ComponentType>): ComponentType | undefined =>
        this.getComponentsByEntityId<ComponentType>(id, componentType)[0];

    public getEntityComponents = <ComponentType>(entity: Entity, componentType: Class<ComponentType>): ComponentType[] =>
        this.getComponentsByEntityId<ComponentType>(entity.getId(), componentType);

    public getEntityComponent = <ComponentType>(entity: Entity | string, componentType: Class<ComponentType>): ComponentType | undefined => {
        let entityId = entity instanceof Entity ? entity.getId() : entity;

        return this.getComponentByEntityId<ComponentType>(entityId, componentType);
    }

    public getComponents = <ComponentType>(componentType: Class<ComponentType>): ComponentType[] =>
        (this.components[componentType.name] ? this.components[componentType.name] : []) as ComponentType[];


    public createEntity = (components: ComponentInterface[], tags: string[] = []): Entity => {
        let newId: string = this.generateNewId()

        components.forEach((component: ComponentInterface) => {
            component.setEntityId(newId)
            this.addComponent(component)
        })

        let entity = new Entity(newId, tags);
        this.addEntity(entity);

        return entity;
    }

    public addEntity = (entity: Entity) => {
        let id: string = entity.getId() === "" ? this.generateNewId() : entity.getId();

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

    public addComponent = (component: ComponentInterface) => {
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

    public removeEntity = (entity: Entity) => {
        if (!entity.getId()) {
            return;
        }

        entity.getTags()?.forEach(tag => {
            let index = this.taggedEntities[tag].indexOf(entity)
            if (index > -1) {
                this.taggedEntities[tag].splice(index, 1);
            }
        });

        let components = this.getComponentsByEntityId(entity.getId(), Component);
        components.forEach(component => {
            this.removeComponent(component);
        });
    }

    public getEntitiesByTag = (tag: string): Entity[] => this.taggedEntities[tag] ? this.taggedEntities[tag] : [];
    public getEntityByTag = (tag: string): Entity | undefined => this.getEntitiesByTag(tag)[0];

    public removeEntitiesWithTag = (tag: string): void =>
        this.getEntitiesByTag(tag).forEach(canvas => {
            this.removeEntity(canvas)
        });

    private generateNewId = (): string => {
        this.lastEntityId++;
        return "Entity_" + this.lastEntityId;
    }
}
