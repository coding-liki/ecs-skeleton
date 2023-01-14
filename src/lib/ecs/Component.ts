export default class Component implements ComponentInterface {
    private entityId: string = 'global'

    public setEntityId = (entityId?: string) => {
        this.entityId = entityId ?? '';

        return this;
    }

    public getEntityId = (): string => this.entityId;

    public getType = (): string => this.constructor.name;
}

export interface ComponentInterface {
    setEntityId(entityId?: string): ComponentInterface;

    getEntityId(): string;

    getType(): string;
}
