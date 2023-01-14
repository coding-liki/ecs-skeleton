import EntityContainer from "./EntityContainer";
import {ComponentSystemInterface} from "./interfaces";
import Entity from "./Entity";
import React from "react";
import {Event} from "@coding-liki/event-manager";

interface eventCallback {
    (event: any): void;
}

export default class ComponentSystem implements ComponentSystemInterface {
    protected isSystemActive: boolean = true;

    public constructor(protected entityContainer: EntityContainer, public name: string) {
    }

    public initComponentField = (fieldRef: string, entity: string | Entity) => {
        let fieldKey = fieldRef as keyof this;
        let field = this[fieldKey];

        if (field) {
            this[fieldKey] = this.entityContainer.getEntityComponent(entity, field.constructor) as this[keyof this];
        }
    }

    public subscribe = (eventClass: Function, handler: eventCallback): this => {
        this.entityContainer
            .getEventManager()
            .subscribe(eventClass, handler);

        return this;
    }

    public unsubscribe = (eventClass: Function, handler: eventCallback): this => {
        this.entityContainer
            .getEventManager()
            .unsubscribe(eventClass, handler);

        return this;
    }

    public dispatch = (event: Event): void => this.entityContainer.getEventManager().dispatch(event);

    public getName = (): string  => this.name;

    public setName = (name: string): void =>  {
        this.name = name;
    }

    public isActive = (): boolean => this.isSystemActive;

    public turnOn = (): void => {
        this.isSystemActive = true;
    }

    public turnOff = (): void => {
        this.isSystemActive = false;
    }

    public render = (): void  => {
        return;
    }

    public reactRender = (): React.ReactNode =>  undefined;

    public onMount = (): void => {
    }

    public onUnMount = (): void => {
    }
}
