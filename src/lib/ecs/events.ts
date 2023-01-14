import {Event} from '@coding-liki/event-manager'
import {ComponentInterface} from './Component'
import {DropContainerComponent} from "../../components";
import {Vector} from "../Math";

export class AddComponentEvent extends Event {
    public constructor(private component: ComponentInterface) {
        super()
    }

    public getComponent = (): ComponentInterface => this.component;
}

export class RemoveComponentEvent extends AddComponentEvent {
}

export class RerenderEvent extends Event {
}

export class FullRerenderEvent extends Event {
}

export class EndedRenderEvent extends Event {
}

export class TurnOnSystemByName extends Event {
    constructor(private name: string) {
        super();
    }

    public getName = (): string => this.name;
}

export class TurnOffSystemByName extends TurnOnSystemByName {
}

export class TurnOnSystemByClass extends Event {
    constructor(private className: Function) {
        super();
    }

    public getClassName = (): Function => this.className;
}

export class TurnOffSystemByClass extends TurnOnSystemByClass {
}

export class DragAndDropEvent extends Event {
    constructor(
        public readonly entityId: string,
        public readonly startPosition: Vector,
        public readonly startDropContainer: DropContainerComponent | undefined,
        public readonly currentDropContainer: DropContainerComponent | undefined
    ) {
        super();
    }
}

export class StartDraggingEvent extends DragAndDropEvent {
}

export class DraggingEvent extends DragAndDropEvent {
}

export class StopDraggingEvent   extends DragAndDropEvent {
}