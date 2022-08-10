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


export class RerenderEvent extends Event{}
