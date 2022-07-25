import { Event } from '@coding-liki/event-manager'
import Component from './Component'

export class AddComponentEvent extends Event {
  private component: Component

  public constructor(component: Component) {
    super()
    this.component = component
  }

  public getComponent = (): Component => {
    return this.component
  }
}

export class RemoveComponentEvent extends Event {
  private component: Component

  public constructor(component: Component) {
    super()
    this.component = component
  }

  public getComponent = (): Component => {
    return this.component
  }
}
