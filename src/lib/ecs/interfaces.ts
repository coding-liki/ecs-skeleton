import EntityContainer from "./EntityContainer";

export interface ComponentSystemInterface {
    turnOn(): void;

    turnOff(): void;

    isActive(): boolean;

    render(): void;

    renderComponent(): any;

    onMount(): void;

    onUnMount(): void;

    getName(): string;

    setName(name: string): void;
}

export type ComponentSystemConstructor = {
    new(entityContainer: EntityContainer, name: string, ...otherThings: any[]): ComponentSystemInterface;
};

export type SystemTemplate = {
    className: ComponentSystemConstructor
    name?: string
    after?: Function | string
    before?: Function | string
}

export interface SystemContainerInterface {
    initSystem(className: ComponentSystemConstructor, name?: string): SystemContainerInterface;

    initSystemAfter(className: ComponentSystemConstructor, after: Function | string, name?: string): SystemContainerInterface;

    initSystemBefore(className: ComponentSystemConstructor, before: Function | string, name?: string): SystemContainerInterface;

    initTemplate(systems: SystemTemplate[]): SystemContainerInterface;

    getActive(): ComponentSystemInterface[];

    getAll(): ComponentSystemInterface[];

    getByName(name: string): ComponentSystemInterface | undefined;

    getByClass<SystemClass extends ComponentSystemInterface>(className: Function): SystemClass[] | undefined;

    getFirstByClass<SystemClass extends ComponentSystemInterface>(className: Function): SystemClass | undefined;
}
