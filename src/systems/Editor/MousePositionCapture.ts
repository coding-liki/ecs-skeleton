import {
    MAIN_CAMERA,
    MAIN_MOUSE,
    MAIN_CANVAS,
    MouseEventComponent,
    MousePositionComponent,
    HtmlElementComponent,
    CanvasComponent,
    CameraComponent,
} from '../../components'
import {Vector} from '../../lib'
import ComponentSystem from '../../lib/ecs/ComponentSystem'

export default class MousePositionCapture extends ComponentSystem {
    private canvasComponent: CanvasComponent = new CanvasComponent;
    mousePositionComponent: MousePositionComponent = new MousePositionComponent;
    mouseEventComponent: MouseEventComponent = new MouseEventComponent;
    htmlElementComponent: HtmlElementComponent = new HtmlElementComponent;
    cameraComponent: CameraComponent = new CameraComponent;

    public onMount = (): void => {
        let mouse = this.entityContainer.getEntityByTag(MAIN_MOUSE)!;
        let camera = this.entityContainer.getEntityByTag(MAIN_CAMERA)!;
        let canvas = this.entityContainer.getEntityByTag(MAIN_CANVAS)!;

        this.initComponentField("canvasComponent", canvas);
        this.initComponentField("htmlElementComponent", camera);
        this.initComponentField("cameraComponent", camera);
        this.initComponentField("mousePositionComponent", mouse);
        this.initComponentField("mouseEventComponent", mouse);

        this.addMoveHandler();
    }

    public onUnMount = (): void => {
        this.removeMoveHandler();
    }

    public addMoveHandler = () => {
        if (!this.htmlElementComponent.element) {
            setTimeout(this.addMoveHandler);
            return;
        }

        this.htmlElementComponent.element.addEventListener('mousemove', this.onMove);
    }

    public onMove = (event: MouseEvent) => {
        if (this.mouseEventComponent.event) {
            this.mouseEventComponent.previousEvent = this.mouseEventComponent?.event;
        }

        this.mouseEventComponent.event = event;

        if (
            !this.cameraComponent.camera ||
            !this.htmlElementComponent.element ||
            !this.canvasComponent.canvas
        ) {
            return;
        }

        this.mousePositionComponent.previousPosition = this.mousePositionComponent.position.clone();

        let computedStyle = getComputedStyle(this.htmlElementComponent.element);

        let editorRect = this.htmlElementComponent.element.getBoundingClientRect();
        let canvasRect = this.canvasComponent.canvas.getBoundingClientRect();
        let initViewport = this.cameraComponent.camera.initViewBox;
        let currentViewport = this.cameraComponent.camera.get2DViewBox();

        let scaledDimensions = initViewport.dimensions.clone().mul(this.canvasComponent.upscaleFactor);

        let widthRatio =
            scaledDimensions.x /
            currentViewport.dimensions.x;

        let heightRatio =
            scaledDimensions.y /
            currentViewport.dimensions.y;

        let mouseEvent = this.mouseEventComponent.event;

        this.mousePositionComponent.position = new Vector(
            mouseEvent.clientX - canvasRect!.left - editorRect.left - parseFloat(computedStyle.borderLeftWidth),
            mouseEvent.clientY - canvasRect!.top - editorRect.top - parseFloat(computedStyle.borderTopWidth)
        );
        this.mousePositionComponent.position.div(new Vector(widthRatio, heightRatio)).plus(currentViewport.position);
    }

    public removeMoveHandler = () => {
        if (!this.htmlElementComponent.element) {
            return;
        }

        this.htmlElementComponent.element.removeEventListener('mousemove', this.onMove);
    }
}
