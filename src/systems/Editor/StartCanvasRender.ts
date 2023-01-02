import {
    CameraComponent,
    CanvasComponent,
    MAIN_CAMERA,
    MAIN_CANVAS,
    MAIN_MOUSE,
    MousePositionComponent
} from "../../components";
import {CanvasViewBox} from "../../lib/Canvas";
import ComponentSystem from "../../lib/ecs/ComponentSystem";

export default class StartCanvasRender extends ComponentSystem {
    private cameraComponent: CameraComponent = new CameraComponent;
    private canvasComponent: CanvasComponent = new CanvasComponent;

    private canvasViewbox?: CanvasViewBox;

    mousePositionComponent: MousePositionComponent = new MousePositionComponent;

    public onMount(): void {
        let camera = this.entityContainer.getEntityByTag(MAIN_CAMERA)!;
        let canvas = this.entityContainer.getEntityByTag(MAIN_CANVAS)!;
        let mouse = this.entityContainer.getEntityByTag(MAIN_MOUSE)!;

        this.initComponentField("mousePositionComponent", mouse);
        this.initComponentField("cameraComponent", camera);
        this.initComponentField("canvasComponent", canvas);
    }

    public render(): void {
        if (!this.cameraComponent.camera || !this.canvasComponent.canvas) {
            return;
        }

        let context2d = this.canvasComponent.canvas.getContext('2d');
        if (!context2d) {
            return;
        }
        this.canvasViewbox = new CanvasViewBox(context2d, this.canvasComponent.scaleMode);

        let width = this.canvasComponent.canvas.width, height = this.canvasComponent.canvas.height;
        context2d.clearRect(0, 0, width, height);
        context2d.save();
        this.canvasViewbox.transformContextMatrix(this.cameraComponent.camera.get2DViewBox());

        return;
    }
}