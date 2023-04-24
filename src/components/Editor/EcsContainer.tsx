import {
    Camera,
    EndedRenderEvent,
    Entity,
    EntityContainer,
    FullRerenderEvent,
    RerenderEvent,
    SystemContainerInterface,
    Vector,
    Viewbox
} from '../../lib'
import {CameraComponent, HtmlElementComponent} from './components'
import {MAIN_CAMERA} from './constants'

export default class EcsContainer{
    cameraComponent: CameraComponent = new CameraComponent;
    htmlElementComponent: HtmlElementComponent = new HtmlElementComponent;
    cameraEntity?: Entity;

    init = () => {
        this.cameraComponent.camera = new Camera(new Vector(0, 0, -1), new Viewbox(new Vector(0, 0), new Vector(500, 500)));

        this.refillCameraEntity();
    }


    constructor(private entityContainer: EntityContainer, private systemContainer: SystemContainerInterface) {
    }

    private refillCameraEntity = () => {
        this.entityContainer.removeEntitiesWithTag(MAIN_CAMERA);

        this.cameraEntity = this.entityContainer.createEntity([
            this.cameraComponent,
            this.htmlElementComponent
        ], [MAIN_CAMERA]);
    }

    public onMount = () => {
        this.init();

        this.systemContainer.getAll().forEach((system) => {
            system.onMount()
        })

        this.entityContainer.getEventManager().subscribe(FullRerenderEvent, this.fullRerender);
        this.entityContainer.getEventManager().subscribe(RerenderEvent, this.rerender);
    }

    public rerender = (event?: RerenderEvent) => {
        this.systemContainer.getActive().forEach(system => system.render());

        this.entityContainer.getEventManager().dispatch(new EndedRenderEvent);
    }

    public onUnmount = () => {
        this.systemContainer.getAll().forEach((system) => system.onUnMount());

        this.entityContainer.getEventManager().unsubscribe(FullRerenderEvent, this.fullRerender);
        this.entityContainer.getEventManager().unsubscribe(RerenderEvent, this.rerender);
    }

    public fullRerender = (event?: FullRerenderEvent) => {
        this.rerender();
        this.renderComponents();
    }

    public renderComponents = (): any => {
        return this.systemContainer.getActive().map( (system) => system.renderComponent() );
    }
}
