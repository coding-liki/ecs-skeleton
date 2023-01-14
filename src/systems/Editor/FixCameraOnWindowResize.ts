import {CameraComponent, CanvasComponent, HtmlElementComponent} from "../../components";
import {MAIN_CAMERA, MAIN_CANVAS} from "../../components";
import {Camera, FullRerenderEvent, Vector, Viewbox} from "../../lib";
import ComponentSystem from "../../lib/ecs/ComponentSystem";

export default class FixCameraOnWindowResize extends ComponentSystem {
    cameraComponent: CameraComponent = new CameraComponent;
    htmlElementComponent: HtmlElementComponent = new HtmlElementComponent;
    canvasComponent: CanvasComponent = new CanvasComponent;

    public onMount = (): void => {
        let camera = this.entityContainer.getEntityByTag(MAIN_CAMERA)!;
        let canvas = this.entityContainer.getEntityByTag(MAIN_CANVAS)!;

        this.initComponentField("htmlElementComponent", camera);
        this.initComponentField("cameraComponent", camera);
        this.initComponentField("canvasComponent", canvas);

        window.onresize = () => {
            this.onWindowResize();
        }
        this.onWindowResize(true);
    }

    public onWindowResize = (needDelay: boolean = false) => {
        if (!this.htmlElementComponent.element || !this.cameraComponent.camera || !this.canvasComponent.canvas) {
            setTimeout(this.onWindowResize);
            return;
        }

        let computedStyle = getComputedStyle(document.body);

        let editorRect = this.canvasComponent.canvas.getBoundingClientRect();

        let width = window.innerWidth - parseFloat(computedStyle.paddingTop) - parseFloat(computedStyle.paddingBottom) - editorRect.left;
        let height = window.innerHeight - parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight) - editorRect.top;

        let newPosition = this.cameraComponent.camera.position.clone().sub(width / 2, height / 2);
        newPosition.z = -1;

        let newDimensions = new Vector(width, height);

        this.cameraComponent.camera = new Camera(this.cameraComponent.camera.position.clone(), new Viewbox(newPosition, newDimensions), newPosition);

        if (needDelay) {
            setTimeout(() => {
                this.dispatch(new FullRerenderEvent);
            });
        } else {
            this.dispatch(new FullRerenderEvent);
        }
    }

    public onUnMount = (): void => {
        window.onresize = null;
    }
}