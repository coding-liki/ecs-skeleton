import {CameraComponent, MAIN_CAMERA, MAIN_MOUSE, MousePositionComponent, HtmlElementComponent} from "../../components";
import {RerenderEvent} from "../../lib";
import ComponentSystem from "../../lib/ecs/ComponentSystem";

export default class ZoomOnWheel extends ComponentSystem {
    private cameraComponent: CameraComponent = new CameraComponent;
    private htmlElementComponent: HtmlElementComponent = new HtmlElementComponent;
    private mousePositionComponent: MousePositionComponent = new MousePositionComponent;

    public onMount = (): void => {
        let camera = this.entityContainer.getEntityByTag(MAIN_CAMERA)!;
        let mouse = this.entityContainer.getEntityByTag(MAIN_MOUSE)!;

        this.initComponentField("htmlElementComponent", camera);
        this.initComponentField("cameraComponent", camera);
        this.initComponentField("mousePositionComponent", mouse);

        this.addWheelHandler();
    }

    public onUnMount = (): void => {
        this.removeWheelHandler();
    }

    private addWheelHandler = (): void => {
        if (!this.htmlElementComponent.element) {
            setTimeout(this.addWheelHandler);
            return;
        }

        this.htmlElementComponent.element.addEventListener('wheel', this.onWheel);
    }

    private removeWheelHandler = (): void => {
        if (!this.htmlElementComponent.element) {
            return;
        }
        this.htmlElementComponent.element.removeEventListener('wheel', this.onWheel);
    }

    private onWheel = (event: WheelEvent) => {
        if (!this.cameraComponent.camera || !this.mousePositionComponent.position) {
            return;
        }

        this.cameraComponent.camera.zoom(this.mousePositionComponent.position, event.deltaY * (-0.0015));
        this.dispatch(new RerenderEvent);
    }
}
