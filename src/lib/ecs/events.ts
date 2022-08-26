import { Event } from '@coding-liki/event-manager'
import { ComponentInterface } from './Component'

export class AddComponentEvent extends Event {
  private component: ComponentInterface

  public constructor(component: ComponentInterface) {
    super()
    this.component = component
  }

  public getComponent = (): ComponentInterface => {
    return this.component
  }
}

export class RemoveComponentEvent extends Event {
  private component: ComponentInterface

  public constructor(component: ComponentInterface) {
    super()
    this.component = component
  }

  public getComponent = (): ComponentInterface => {
    return this.component
  }
}


export class RerenderEvent extends Event { }
export class FullRerenderEvent extends Event { }
export class EndedRenderEvent extends Event { }

export class TurnOnSystemByName extends Event {
  private name: string
  constructor(name: string) {
    super();
    this.name = name
  }

  public getName(): string {
    return this.name;
  }
}

export class TurnOffSystemByName extends Event {
  private name: string
  constructor(name: string) {
    super();
    this.name = name
  }

  public getName(): string {
    return this.name;
  }
}

export class TurnOnSystemByClass extends Event {
  private className: Function
  constructor(className: Function) {
    super();
    this.className = className
  }

  public getClassName(): Function {
    return this.className;
  }
}

export class TurnOffSystemByClass extends Event {
  private className: Function
  constructor(className: Function) {
    super();
    this.className = className
  }

  public getClassName(): Function {
    return this.className;
  }
}
