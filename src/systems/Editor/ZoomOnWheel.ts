import { CameraComponent, MAIN_CAMERA, MAIN_MOUSE, MouseEventComponent, MousePositionComponent, SvgNodeComponent } from "../../components";
import { ComponentSystem, RerenderEvent } from "../../lib";

export default class ZoomOnWheel extends ComponentSystem {
    cameraComponent?: CameraComponent;
    svgNodeComponent?: SvgNodeComponent;

    mousePositionComponent?: MousePositionComponent;

    public onMount(): void {

        let camera = this.entityContainer.getEntityByTag(MAIN_CAMERA);
        let mouse = this.entityContainer.getEntityByTag(MAIN_MOUSE);

        this.svgNodeComponent = this.entityContainer.getEntityComponent<SvgNodeComponent>(camera!, SvgNodeComponent);
        this.cameraComponent = this.entityContainer.getEntityComponent<CameraComponent>(camera!, CameraComponent);


        this.mousePositionComponent = this.entityContainer.getEntityComponent<MousePositionComponent>(mouse!, MousePositionComponent);

        this.addWheelHandler();
    }

    public onUnMount(): void {
        this.removeWheelHandler();
    }

    private addWheelHandler = () => {
        if (!this.svgNodeComponent || !this.svgNodeComponent.svgNode) {
            setTimeout(this.addWheelHandler);
            return;
        }

        this.svgNodeComponent!.svgNode!.addEventListener('wheel', this.onWheel)
    }

    private removeWheelHandler() {
        this.svgNodeComponent!.svgNode!.removeEventListener('wheel', this.onWheel)
    }

    private onWheel = (event: WheelEvent) => {
        console.log("Wheeel");

        let delta = event.deltaY * (-0.0015);
        this.cameraComponent?.camera?.zoom(this!.mousePositionComponent!.position, delta);
        this.entityContainer.getEventManager().dispatch(new RerenderEvent);
    }

}
