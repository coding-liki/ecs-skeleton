import {
    CameraComponent,
    MAIN_CAMERA,
    MAIN_MOUSE,
    MousePositionComponent,
    HtmlElementComponent,
    CanvasComponent,
    MAIN_CANVAS,
    SvgPathComponent,
    PositionComponent,
    DraggableComponent,
    DropContainerComponent,
} from '../../components'
import {AddComponentEvent, FullRerenderEvent, Vector} from '../../lib'
import ComponentSystem from '../../lib/ecs/ComponentSystem'

type DraggablePathData = {
    path: SvgPathComponent
    position: PositionComponent
    dragState: DraggableComponent
};

type DropContainerData = {
    path: SvgPathComponent
    position: PositionComponent
    dropContainer: DropContainerComponent
};

type MovingPath = {
    path: DraggablePathData
    startPosition: Vector
    dragPoint: Vector
};

export const DROP_GLOBAL = "global";

export default class DragAndDrop extends ComponentSystem {
    private canvasComponent: CanvasComponent = new CanvasComponent
    private context?: CanvasRenderingContext2D;
    mousePositionComponent: MousePositionComponent = new MousePositionComponent
    htmlElementComponent: HtmlElementComponent = new HtmlElementComponent
    cameraComponent: CameraComponent = new CameraComponent
    pathsData: DraggablePathData[] = [];
    dropContainersData: DropContainerData[] = [];

    movingPathData?: MovingPath;

    public onMount(): void {
        let mouse = this.entityContainer.getEntityByTag(MAIN_MOUSE)
        let camera = this.entityContainer.getEntityByTag(MAIN_CAMERA);
        let canvas = this.entityContainer.getEntityByTag(MAIN_CANVAS);
        this.canvasComponent = this.entityContainer.getEntityComponent<CanvasComponent>(canvas!, CanvasComponent)!;

        this.htmlElementComponent =
            this.entityContainer.getEntityComponent<HtmlElementComponent>(
                camera!,
                HtmlElementComponent
            )!

        this.mousePositionComponent =
            this.entityContainer.getEntityComponent<MousePositionComponent>(
                mouse!,
                MousePositionComponent
            )!

        this.entityContainer
            .getEventManager()
            .subscribe(AddComponentEvent, this.onAddComponent);

        this.getPathsData();

        this.addEvents();
    }

    public onUnMount(): void {
        this.entityContainer
            .getEventManager()
            .unsubscribe(AddComponentEvent, this.onAddComponent);

        this.removeEvents();

    }


    private onAddComponent = (event: AddComponentEvent) => {
        if (!(event.getComponent() instanceof DraggableComponent) && !(event.getComponent() instanceof DropContainerComponent)) {
            return;
        }

        this.getPathsData();
    }

    private getPathsData = () => {
        let dragStates = this.entityContainer.getComponents<DraggableComponent>(DraggableComponent);
        this.pathsData = [];
        dragStates.forEach((dragState: DraggableComponent) => {
            let position = this.entityContainer.getComponentByEntityId<PositionComponent>(dragState.getEntityId(), PositionComponent)!;
            let path = this.entityContainer.getComponentByEntityId<SvgPathComponent>(dragState.getEntityId(), SvgPathComponent)!;
            this.pathsData.push({
                path: path,
                position: position,
                dragState: dragState
            });
        });

        let dropContainers = this.entityContainer.getComponents<DropContainerComponent>(DropContainerComponent);
        this.dropContainersData = [];
        dropContainers.forEach((dropContainer: DropContainerComponent) => {
            let position = this.entityContainer.getComponentByEntityId<PositionComponent>(dropContainer.getEntityId(), PositionComponent)!;
            let path = this.entityContainer.getComponentByEntityId<SvgPathComponent>(dropContainer.getEntityId(), SvgPathComponent)!;
            this.dropContainersData.push({
                path: path,
                position: position,
                dropContainer: dropContainer
            });
        });
    }

    private addEvents = () => {
        if (!this.htmlElementComponent.element) {
            setTimeout(this.addEvents)
            return
        }

        this.htmlElementComponent.element.addEventListener('mousemove', this.onMove)
        this.htmlElementComponent.element.addEventListener('mousedown', this.onDown)
        this.htmlElementComponent.element.addEventListener('mouseup', this.onUp)
    }
    private removeEvents = () => {
        if (!this.htmlElementComponent.element) {
            return;
        }

        this.htmlElementComponent.element.removeEventListener('mousemove', this.onMove)
        this.htmlElementComponent.element.removeEventListener('mousedown', this.onDown)
        this.htmlElementComponent.element.removeEventListener('mouseup', this.onUp)

    }
    onMove = (event: MouseEvent) => {
        if (!this.movingPathData) {
            return;
        }

        let coordinates = this.movingPathData.path.position.coordinates;

        coordinates.x = 0;
        coordinates.y = 0;

        coordinates.add(this.mousePositionComponent.position).add(this.movingPathData.dragPoint);
        this.entityContainer.getEventManager().dispatch(new FullRerenderEvent);

    }


    private onDown = (event: MouseEvent) => {
        if (this.movingPathData) {
            return;
        }

        this.pathsData.forEach(this.tryStartDrag);
    }

    private onUp = (event: MouseEvent) => {
        if (!this.movingPathData) {
            return;
        }

        this.dropContainersData.forEach(this.tryDrop)

        if (!this.movingPathData) {
            return;
        }

        if (!this.movingPathData.path.dragState.tags.includes(DROP_GLOBAL)) {
            this.movingPathData.path.position.coordinates = Vector.fromCoordinates(this.movingPathData.startPosition);
        }

        this.clearMovingPath();
    }

    private clearMovingPath() {
        this.movingPathData = undefined;
        this.entityContainer.getEventManager().dispatch(new FullRerenderEvent);
    }

    private tryStartDrag = (pathData: DraggablePathData) => {
        if (!this.canvasComponent.canvas || this.movingPathData) {
            return;
        }
        let path2d = new Path2D();
        path2d.addPath(new Path2D(pathData.path.path), {
            e: pathData.position.coordinates.x,
            f: pathData.position.coordinates.y
        });

        let context = this.canvasComponent.canvas.getContext('2d')!;

        let mousePosition = this.mousePositionComponent.position;

        if (context.isPointInPath(path2d, mousePosition.x, mousePosition.y)) {
            this.movingPathData = {
                path: pathData,
                startPosition: pathData.position.coordinates.clone(),
                dragPoint: pathData.position.coordinates.clone().sub(mousePosition)
            }
        }
    }

    private tryDrop = (dropContainerData: DropContainerData) => {
        if (!this.canvasComponent.canvas || !this.movingPathData) {
            return;
        }

        let path2d = new Path2D();
        path2d.addPath(new Path2D(dropContainerData.path.path), {
            e: dropContainerData.position.coordinates.x,
            f: dropContainerData.position.coordinates.y
        });

        let context = this.canvasComponent.canvas.getContext('2d')!;

        let mousePosition = this.mousePositionComponent.position;
        if (!context.isPointInPath(path2d, mousePosition.x, mousePosition.y)) {
            return;
        }

        if (this.movingPathData.path.dragState.tags.filter((dragTag: string) => dropContainerData.dropContainer.acceptedTags.includes(dragTag)).length === 0) {
            return;
        }

        this.clearMovingPath();
    }
}
