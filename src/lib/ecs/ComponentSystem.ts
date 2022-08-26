import EntityContainer from "./EntityContainer";
import { ComponentSystemInterface } from "./interfaces";

export default class ComponentSystem implements ComponentSystemInterface {
  protected entityContainer: EntityContainer;
  protected isSystemActive: boolean = true;
  name: string;

  public constructor(entityContainer: EntityContainer, name: string) {
    this.entityContainer = entityContainer;
    this.name = name;
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
