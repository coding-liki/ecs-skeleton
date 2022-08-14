import { CameraComponent, SvgNodeComponent } from "../../components";
import { MAIN_CAMERA } from "../../components/Editor/constants";
import { Camera, ComponentSystem, RerenderEvent, Vector, Viewport } from "../../lib";

export default class FixCameraOnWindowResize extends ComponentSystem {
    cameraComponent?: CameraComponent;
    svgNodeComponent?: SvgNodeComponent;

    public onMount(): void {

        let camera = this.entityContainer.getEntityByTag(MAIN_CAMERA);

        this.svgNodeComponent = this.entityContainer.getEntityComponent<SvgNodeComponent>(camera!, SvgNodeComponent);
        this.cameraComponent = this.entityContainer.getEntityComponent<CameraComponent>(camera!, CameraComponent);

        window.onresize = () => {
            this.onWindowResize();
        }
        this.onWindowResize(true)
    }

    onWindowResize = (needDelay: boolean = false) => {
        let computedStyle = getComputedStyle(document.body);

        let editorRect = this.svgNodeComponent!.svgNode!.getBoundingClientRect();

        let width = window.innerWidth - parseFloat(computedStyle.paddingTop) - parseFloat(computedStyle.paddingBottom) - editorRect.left;
        let height = window.innerHeight - parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight) - editorRect.top;

        let newPosition = this.cameraComponent!.camera!.position.clone().subXY(width / 2, height / 2);
        newPosition.z = -1;

        let newDimensions = new Vector(width, height);

        this.cameraComponent!.camera = new Camera(this.cameraComponent!.camera!.position.clone(), new Viewport(newPosition, newDimensions), newPosition);

        if (needDelay) {
            setTimeout(() => {
                this.entityContainer.getEventManager().dispatch(new RerenderEvent);
            });
        } else {
            this.entityContainer.getEventManager().dispatch(new RerenderEvent)
        }
    }

    public onUnMount(): void {
        window.onresize = null;
    }
}