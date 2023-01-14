import React from "react";

export interface ComponentSystemInterface {
    turnOn(): void;
    turnOff(): void;
    isActive(): boolean;
    render(): void;
    reactRender(): React.ReactNode;
    onMount(): void;
    onUnMount(): void;
    getName(): string;
    setName(name: string): void;
}

export interface SystemContainerInterface {
    initSystem(className: Function, name?: string): SystemContainerInterface;
    getActive(): ComponentSystemInterface[];
    getAll(): ComponentSystemInterface[];
    getByName(name: string): ComponentSystemInterface|undefined;
    getByClass<SystemClass extends ComponentSystemInterface >(className: Function): SystemClass[]|undefined;
    getFirstByClass<SystemClass extends ComponentSystemInterface >(className: Function): SystemClass|undefined;
}