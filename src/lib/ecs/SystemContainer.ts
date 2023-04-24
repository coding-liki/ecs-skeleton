import EntityContainer from "./EntityContainer";
import {TurnOffSystemByClass, TurnOffSystemByName, TurnOnSystemByClass, TurnOnSystemByName} from "./events";
import {
    ComponentSystemConstructor,
    ComponentSystemInterface,
    SystemContainerInterface,
    SystemTemplate
} from "./interfaces";

const NO_NAME = '';


export default class SystemContainer implements SystemContainerInterface {
    private systemsByClass: { [key: string]: ComponentSystemInterface[] } = {};
    private systemsByName: { [key: string]: ComponentSystemInterface } = {};
    private allSystems: ComponentSystemInterface[] = [];
    private activeSystems: ComponentSystemInterface[] = [];

    constructor(private entityContainer: EntityContainer) {
        this.initEvents();
    }

    private initEvents = () => {
        this.entityContainer.getEventManager().subscribe(TurnOnSystemByName, this.turnOnSystemByName);
        this.entityContainer.getEventManager().subscribe(TurnOffSystemByName, this.turnOffSystemByName);
        this.entityContainer.getEventManager().subscribe(TurnOnSystemByClass, this.turnOnSystemByClass);
        this.entityContainer.getEventManager().subscribe(TurnOffSystemByClass, this.turnOffSystemByClass);
    }
    public turnOnSystemByName = (event: TurnOnSystemByName) => {
        this.getByName(event.getName())!.turnOn();
        this.refillActive();
    }
    public turnOffSystemByName = (event: TurnOffSystemByName) => {
        this.getByName(event.getName())!.turnOff();

        this.refillActive();
    }

    public turnOnSystemByClass = (event: TurnOnSystemByClass) => {
        this.getByClass(event.getClassName())!.forEach((system) => system.turnOn());

        this.refillActive();

    }
    public turnOffSystemByClass = (event: TurnOffSystemByClass) => {
        this.getByClass(event.getClassName())!.forEach((system) => system.turnOff());

        this.refillActive();
    }


    public getActive = (): ComponentSystemInterface[] => this.activeSystems;

    public getAll = (): ComponentSystemInterface[] => this.allSystems;

    public getByName = (name: string): ComponentSystemInterface | undefined => this.systemsByName[name];

    public getByClass = <SystemClass extends ComponentSystemInterface>(className: Function): SystemClass[] | undefined =>
        this.systemsByClass[className.name] as SystemClass[];

    public getFirstByClass = <SystemClass extends ComponentSystemInterface>(className: Function): SystemClass | undefined => {
        let systems = this.getByClass<SystemClass>(className)!;
        return systems[0] as SystemClass;
    }

    public initSystem = (className: ComponentSystemConstructor, name: string = NO_NAME, ...otherArgs: any[]): SystemContainerInterface => {
        let system = new className(this.entityContainer, name, ...otherArgs);

        system.turnOn();

        this.registerSystem(system, className);

        this.refillActive();

        return this;
    }


    public initSystemAfter = (className: ComponentSystemConstructor, after: Function | string, name: string = NO_NAME,  ...otherArgs: any[]): SystemContainerInterface => {
        let system = new className(this.entityContainer, name, ...otherArgs);
        system.turnOn();

        this.registerSystem(system, className, after);

        this.refillActive();

        return this;
    }

    public initSystemBefore = (className: ComponentSystemConstructor, before: Function | string, name: string = NO_NAME,  ...otherArgs: any[]): SystemContainerInterface => {
        let system = new className(this.entityContainer, name, ...otherArgs);
        system.turnOn();

        this.registerSystem(system, className, undefined, before);

        this.refillActive();

        return this;
    }

    public initTemplate = (systems: SystemTemplate[]): SystemContainerInterface => {
        systems.forEach((system) => {
            if (system.after) {
                this.initSystemAfter(system.className, system.after, system.name);
            } else if (system.before) {
                this.initSystemAfter(system.className, system.before, system.name);
            } else {
                this.initSystem(system.className, system.name);
            }
        })

        return this;

    }

    private refillActive = () => {
        this.activeSystems = this.allSystems.filter((system) => system.isActive());
    }

    private registerSystem = (system: ComponentSystemInterface, className: Function, after?: Function | string, before?: Function | string): void => {
        if (!this.systemsByClass[className.name]) {
            this.systemsByClass[className.name] = [];
        }

        if (!this.systemsByClass[className.name].includes(system)) {
            this.systemsByClass[className.name].push(system);
        }

        let systemsCount = this.systemsByClass[className.name].length;
        if (system.getName() === NO_NAME) {
            system.setName(className.name + systemsCount);
        }

        this.systemsByName[system.getName()] = system;

        if (after) {
            let systemBeforeCurrent = after instanceof Function ? this.getByClass(after)![0] : this.getByName(after);
            if (systemBeforeCurrent) {
                let systemBeforeIndex = this.allSystems.indexOf(systemBeforeCurrent!);
                if (systemBeforeIndex >= 0 ?? !this.allSystems.includes(system)) {
                    this.allSystems.splice(systemBeforeIndex + 1, 0, system);
                }
            }
        } else if (before) {
            let systemBeforeCurrent = before instanceof Function ? this.getByClass(before)![0] : this.getByName(before);
            if (systemBeforeCurrent) {
                let systemBeforeIndex = this.allSystems.indexOf(systemBeforeCurrent!);
                if (systemBeforeIndex >= 0 ?? !this.allSystems.includes(system)) {
                    this.allSystems.splice(systemBeforeIndex, 0, system);
                }
            }
        }

        if (!this.allSystems.includes(system)) {
            this.allSystems.push(system);
        }
    }
}
