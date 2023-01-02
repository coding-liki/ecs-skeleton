import {CameraComponent, CanvasComponent, MAIN_CAMERA, MAIN_CANVAS} from "../../components";
import ComponentSystem from "../../lib/ecs/ComponentSystem";

export default class EndCanvasRender extends ComponentSystem {
    private cameraComponent: CameraComponent = new CameraComponent;
    private canvasComponent: CanvasComponent = new CanvasComponent;

    public onMount(): void {
        let camera = this.entityContainer.getEntityByTag(MAIN_CAMERA);
        let canvas = this.entityContainer.getEntityByTag(MAIN_CANVAS);

        this.cameraComponent = this.entityContainer.getEntityComponent<CameraComponent>(camera!, CameraComponent)!;
        this.canvasComponent = this.entityContainer.getEntityComponent<CanvasComponent>(canvas!, CanvasComponent)!;
    }

    public render(): void {
        if (!this.cameraComponent.camera || !this.canvasComponent.canvas) {
            return;
        }

        let context2d = this.canvasComponent.canvas.getContext('2d')!;

        context2d.restore();
        return;
    }
}