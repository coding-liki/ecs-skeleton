import EntityContainer from "./EntityContainer";

export default class ComponentSystem{
  protected entityContainer: EntityContainer;

  public constructor(entityContainer: EntityContainer){
    this.entityContainer = entityContainer;
  }
  render = (): React.ReactNode => {
    return;
  }

  public onMount(){

  }

  public onUnMount(){

  }

}
