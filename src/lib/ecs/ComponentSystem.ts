import EntityContainer from "./EntityContainer";
import {ComponentSystemInterface} from "./interfaces";
import Entity from "./Entity";
import React from "react";


export default class ComponentSystem implements ComponentSystemInterface {
    protected entityContainer: EntityContainer;
    protected isSystemActive: boolean = true;
    name: string;

    public constructor(entityContainer: EntityContainer, name: string) {
        this.entityContainer = entityContainer;
        this.name = name;
    }

    public initComponentField = (fieldRef: string, entity: string | Entity) => {
        let fieldKey = fieldRef as keyof this;
        let field = this[fieldKey];

        if (field) {
            this[fieldKey] = this.entityContainer.getEntityComponent(entity, field.constructor) as this[keyof this];
        }
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
    }

    isActive(): boolean {
        return this.isSystemActive;
    }

    turnOn(): void {
        this.isSystemActive = true;
    }

    turnOff(): void {
        this.isSystemActive = false;
    }

    render(): void {
        return;
    }

    reactRender(): React.ReactNode {
        return;
    }

    public onMount(): void {
    }

    public onUnMount(): void {
    }
}
