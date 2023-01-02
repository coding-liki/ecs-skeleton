import EntityContainer from "./EntityContainer";
import {TurnOffSystemByClass, TurnOffSystemByName, TurnOnSystemByClass, TurnOnSystemByName} from "./events";
import {ComponentSystemInterface, SystemContainerInterface} from "./interfaces";

const NO_NAME = '';

type ComponentSystemConstructor = {
    new(entityContainer: EntityContainer, name: string): ComponentSystemInterface;
};

export default class SystemContainer implements SystemContainerInterface {
    private entityContainer: EntityContainer;
    private systemsByClass: { [key: string]: ComponentSystemInterface[] } = {}
    private systemsByName: { [key: string]: ComponentSystemInterface } = {}
    private allSystems: ComponentSystemInterface[] = [];
    private activeSystems: ComponentSystemInterface[] = [];

    constructor(entityContainer: EntityContainer) {
        this.entityContainer = entityContainer;
        this.initEvents();
    }


    initEvents = () => {
        this.entityContainer.getEventManager().subscribe(TurnOnSystemByName, this.turnOnSystemByName);
        this.entityContainer.getEventManager().subscribe(TurnOffSystemByName, this.turnOffSystemByName);
        this.entityContainer.getEventManager().subscribe(TurnOnSystemByClass, this.turnOnSystemByClass);
        this.entityContainer.getEventManager().subscribe(TurnOffSystemByClass, this.turnOffSystemByClass);
    }
    turnOnSystemByName = (event: TurnOnSystemByName) => {
        this.getByName(event.getName())!.turnOn();
        this.refillActive();
    }
    turnOffSystemByName = (event: TurnOffSystemByName) => {
        this.getByName(event.getName())!.turnOff();

        this.refillActive();

    }
    turnOnSystemByClass = (event: TurnOnSystemByClass) => {
        this.getByClass(event.getClassName())!.forEach((system) => system.turnOn());

        this.refillActive();

    }
    turnOffSystemByClass = (event: TurnOffSystemByClass) => {
        this.getByClass(event.getClassName())!.forEach((system) => system.turnOff());

        this.refillActive();
    }


    getActive(): ComponentSystemInterface[] {
        return this.activeSystems;
    }

    getAll(): ComponentSystemInterface[] {
        return this.allSystems;
    }

    getByName(name: string): ComponentSystemInterface | undefined {
        return this.systemsByName[name];
    }

    getByClass<SystemClass extends ComponentSystemInterface>(className: Function): SystemClass[] | undefined {
        return this.systemsByClass[className.name] as SystemClass[];

    }

    getFirstByClass<SystemClass extends ComponentSystemInterface>(className: Function): SystemClass | undefined {
        let systems = this.getByClass<SystemClass>(className)!;
        return systems[0] as SystemClass;
    }

    public initSystem(className: ComponentSystemConstructor, name: string = NO_NAME): SystemContainerInterface {
        let system = new className(this.entityContainer, name);

        system.turnOn();

        this.registerSystem(system, className);

        this.refillActive();

        return this;
    }

    private refillActive() {
        this.activeSystems = this.allSystems.filter((system) => system.isActive());
    }

    private registerSystem(system: ComponentSystemInterface, className: Function): void {
        if (!this.systemsByClass[className.name]) {
            this.systemsByClass[className.name] = [];
        }

        if (!this.systemsByClass[className.name].includes(system)) {
            this.systemsByClass[className.name].push(system)
        }

        let systemsCount = this.systemsByClass[className.name].length;
        if (system.getName() === NO_NAME) {
            system.setName(className.name + systemsCount);
        }

        this.systemsByName[system.getName()] = system;

        if (!this.allSystems.includes(system)) {
            this.allSystems.push(system);
        }
    }


}