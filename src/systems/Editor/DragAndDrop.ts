import {
    CameraComponent,
    CanvasComponent,
    DraggableComponent,
    DragState,
    DropContainerComponent,
    HtmlElementComponent,
    MAIN_CAMERA,
    MAIN_CANVAS,
    MAIN_MOUSE,
    MousePositionComponent,
    PositionComponent,
    SvgPathComponent,
} from '../../components'
import {AddComponentEvent, FullRerenderEvent, RemoveComponentEvent, Vector} from '../../lib'
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
    mousePositionComponent: MousePositionComponent = new MousePositionComponent
    htmlElementComponent: HtmlElementComponent = new HtmlElementComponent
    cameraComponent: CameraComponent = new CameraComponent
    pathsData: DraggablePathData[] = [];
    dropContainersData: DropContainerData[] = [];

    movingPathData?: MovingPath;

    public onMount(): void {
        let mouse = this.entityContainer.getEntityByTag(MAIN_MOUSE)!;
        let camera = this.entityContainer.getEntityByTag(MAIN_CAMERA)!;
        let canvas = this.entityContainer.getEntityByTag(MAIN_CANVAS)!;

        this.initComponentField("canvasComponent", canvas)
        this.initComponentField("htmlElementComponent", camera)
        this.initComponentField("cameraComponent", camera)
        this.initComponentField("mousePositionComponent", mouse)

        this.entityContainer
            .getEventManager()
            .subscribe(AddComponentEvent, this.onAddComponent)
            .subscribe(RemoveComponentEvent, this.onRemoveComponent);

        this.getPathsData();

        this.addEvents();
    }

    public onUnMount(): void {
        this.entityContainer
            .getEventManager()
            .unsubscribe(AddComponentEvent, this.onAddComponent)
            .unsubscribe(RemoveComponentEvent, this.onRemoveComponent);

        this.removeEvents();
    }


    private onAddComponent = (event: AddComponentEvent) => {
        if (!(event.getComponent() instanceof DraggableComponent) && !(event.getComponent() instanceof DropContainerComponent)) {
            return;
        }

        this.getPathsData();
    }

    private onRemoveComponent = (event: RemoveComponentEvent) => {
        if (!(event.getComponent() instanceof DraggableComponent) && !(event.getComponent() instanceof DropContainerComponent)) {
            return;
        }

        this.getPathsData();
    }

    private getPathsData = () => {
        let dragStates: DraggableComponent[] = this.entityContainer.getComponents(DraggableComponent);
        this.pathsData = [];
        dragStates.forEach((dragState: DraggableComponent) => {
            let position: PositionComponent = this.entityContainer.getComponentByEntityId(dragState.getEntityId(), PositionComponent)!;
            let path: SvgPathComponent = this.entityContainer.getComponentByEntityId(dragState.getEntityId(), SvgPathComponent)!;
            this.pathsData.push({
                path: path,
                position: position,
                dragState: dragState
            });
        });

        let dropContainers: DropContainerComponent[] = this.entityContainer.getComponents(DropContainerComponent);
        this.dropContainersData = [];
        dropContainers.forEach((dropContainer: DropContainerComponent) => {
            let position: PositionComponent = this.entityContainer.getEntityComponent(dropContainer.getEntityId(), PositionComponent)!;
            let path: SvgPathComponent = this.entityContainer.getEntityComponent(dropContainer.getEntityId(), SvgPathComponent)!;
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
        if (this.movingPathData) {
            this.movingPathData.path.dragState.state = DragState.NOT_DRAGGING;
            this.movingPathData = undefined;
            this.entityContainer.getEventManager().dispatch(new FullRerenderEvent);
        }
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
            pathData.dragState.state = DragState.DRAGGING;
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
        let dragState = this.movingPathData.path.dragState;
        let dropContainer = dropContainerData.dropContainer;
        let oldDropContainer: DropContainerComponent | undefined;
        if (dragState.tags.filter((dragTag: string) => dropContainer.acceptedTags.includes(dragTag)).length === 0) {
            return;
        }

        if (!dropContainer.entities.includes(dragState.getEntityId())) {
            dropContainer.entities.push(dragState.getEntityId());

            if (dragState.dropContainerEntityId) {
                oldDropContainer = this.entityContainer.getEntityComponent(dragState.dropContainerEntityId, DropContainerComponent)!;
                oldDropContainer.entities.filter((entityId: string) => dragState.getEntityId() !== entityId);
            }
            dragState.dropContainerEntityId = dropContainer.getEntityId();
        }

        this.clearMovingPath();
    }
}
