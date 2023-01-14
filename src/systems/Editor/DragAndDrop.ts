import {
    CameraComponent,
    CanvasComponent,
    DraggableComponent,
    DragState,
    ContainerComponent,
    HtmlElementComponent,
    MAIN_CAMERA,
    MAIN_CANVAS,
    MAIN_MOUSE,
    MousePositionComponent,
    PositionComponent,
    SvgPathComponent,
} from '../../components'
import {
    AddComponentEvent,
    DraggingEvent,
    FullRerenderEvent,
    RemoveComponentEvent,
    StartDraggingEvent, StopDraggingEvent,
    Vector
} from '../../lib'
import ComponentSystem from '../../lib/ecs/ComponentSystem'

type DraggablePathData = {
    path: SvgPathComponent
    position: PositionComponent
    dragState: DraggableComponent
};

type DropContainerData = {
    path: SvgPathComponent
    position: PositionComponent
    dropContainer: ContainerComponent
};

type MovingPath = {
    path: DraggablePathData
    startPosition: Vector
    dragPoint: Vector
    startDropContainer: DropContainerData | undefined
};

export const DROP_GLOBAL = "global";

export default class DragAndDrop extends ComponentSystem {
    private canvasComponent: CanvasComponent = new CanvasComponent;
    private mousePositionComponent: MousePositionComponent = new MousePositionComponent;
    private htmlElementComponent: HtmlElementComponent = new HtmlElementComponent;
    private cameraComponent: CameraComponent = new CameraComponent;
    private pathsData: DraggablePathData[] = [];
    private dropContainersData: DropContainerData[] = [];

    private movingPathData?: MovingPath;

    public onMount = (): void => {
        let mouse = this.entityContainer.getEntityByTag(MAIN_MOUSE)!;
        let camera = this.entityContainer.getEntityByTag(MAIN_CAMERA)!;
        let canvas = this.entityContainer.getEntityByTag(MAIN_CANVAS)!;

        this.initComponentField("canvasComponent", canvas);
        this.initComponentField("htmlElementComponent", camera);
        this.initComponentField("cameraComponent", camera);
        this.initComponentField("mousePositionComponent", mouse);

        this.subscribe(AddComponentEvent, this.onAddComponent)
            .subscribe(RemoveComponentEvent, this.onRemoveComponent);

        this.getPathsData();

        this.addEvents();
    }

    public onUnMount = (): void => {
        this.unsubscribe(AddComponentEvent, this.onAddComponent)
            .unsubscribe(RemoveComponentEvent, this.onRemoveComponent);

        this.removeEvents();
    }


    private onAddComponent = (event: AddComponentEvent) => {
        event.getComponent() instanceof DraggableComponent || event.getComponent() instanceof ContainerComponent ? this.getPathsData() : null;
    }

    private onRemoveComponent = (event: RemoveComponentEvent) => {
        event.getComponent() instanceof DraggableComponent || event.getComponent() instanceof ContainerComponent ? this.getPathsData() : null;
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

        let dropContainers: ContainerComponent[] = this.entityContainer.getComponents(ContainerComponent);
        this.dropContainersData = [];
        dropContainers.forEach((dropContainer: ContainerComponent) => {
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
            setTimeout(this.addEvents);
            return;
        }

        this.htmlElementComponent.element.addEventListener('mousemove', this.onMove);
        this.htmlElementComponent.element.addEventListener('mousedown', this.onDown);
        this.htmlElementComponent.element.addEventListener('mouseup', this.onUp);
    }
    private removeEvents = () => {
        if (!this.htmlElementComponent.element) {
            return;
        }

        this.htmlElementComponent.element.removeEventListener('mousemove', this.onMove);
        this.htmlElementComponent.element.removeEventListener('mousedown', this.onDown);
        this.htmlElementComponent.element.removeEventListener('mouseup', this.onUp);

    }
    public onMove = (event: MouseEvent) => {
        if (!this.movingPathData) {
            return;
        }

        let coordinates = this.movingPathData.path.position.coordinates;

        coordinates.x = 0;
        coordinates.y = 0;

        coordinates.plus(this.mousePositionComponent.position).plus(this.movingPathData.dragPoint);

        let currentDropContainer = this.getCurrentDropContainer();

        this.dispatch(new DraggingEvent(
            this.movingPathData.path.path.getEntityId(),
            this.movingPathData.startPosition,
            this.movingPathData.startDropContainer?.dropContainer,
            currentDropContainer?.dropContainer
        ));

        this.dispatch(new FullRerenderEvent);
    }

    public onDown = (event: MouseEvent) => {
        if (this.movingPathData) {
            return;
        }

        this.pathsData.sort((a, b) => {
            return b.path.zIndex - a.path.zIndex;
        }).forEach(this.tryStartDrag);
    }

    public onUp = (event: MouseEvent) => {
        if (!this.movingPathData) {
            return;
        }

        let currentDropContainer = this.getCurrentDropContainer();
        if (currentDropContainer) {
            this.tryDrop(currentDropContainer);
        }

        if (!this.movingPathData) {
            return;
        }

        if (!this.movingPathData.path.dragState.tags.includes(DROP_GLOBAL)) {
            this.movingPathData.path.position.coordinates = Vector.fromCoordinates(this.movingPathData.startPosition);
        }

        this.clearMovingPath();
    }

    private clearMovingPath = () => {
        if (this.movingPathData) {
            let currentDropContainer = this.getCurrentDropContainer();

            this.dispatch(new StopDraggingEvent(
                this.movingPathData.path.path.getEntityId(),
                this.movingPathData.startPosition,
                this.movingPathData.startDropContainer?.dropContainer,
                currentDropContainer?.dropContainer
            ));

            this.movingPathData.path.dragState.state = DragState.NOT_DRAGGING;
            this.movingPathData = undefined;
            this.dispatch(new FullRerenderEvent);
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
            let currentDropContainer = this.getCurrentDropContainer();

            this.movingPathData = {
                path: pathData,
                startPosition: pathData.position.coordinates.clone(),
                dragPoint: pathData.position.coordinates.clone().sub(mousePosition),
                startDropContainer: currentDropContainer
            };
            pathData.dragState.state = DragState.DRAGGING;

            this.dispatch(new StartDraggingEvent(
                pathData.path.getEntityId(),
                this.movingPathData.startPosition,
                currentDropContainer?.dropContainer,
                currentDropContainer?.dropContainer
            ));
        } else {
            pathData.dragState.state = DragState.NOT_DRAGGING;
        }
    }

    private getCurrentDropContainer = (): DropContainerData | undefined => {
        let filteredContainers = this.dropContainersData.sort((a, b) => {
            return a.path.zIndex - b.path.zIndex;
        }).filter(this.isInDropContainer);

        return filteredContainers[filteredContainers.length - 1];
    }

    private isInDropContainer = (dropContainerData: DropContainerData): boolean => {
        if (!this.canvasComponent.canvas || !this.movingPathData) {
            return false;
        }

        let path2d = new Path2D();
        path2d.addPath(new Path2D(dropContainerData.path.path), {
            e: dropContainerData.position.coordinates.x,
            f: dropContainerData.position.coordinates.y
        });

        let context = this.canvasComponent.canvas.getContext('2d')!;

        let mousePosition = this.mousePositionComponent.position;
        return context.isPointInPath(path2d, mousePosition.x, mousePosition.y);
    }

    private tryDrop = (dropContainerData: DropContainerData) => {
        if (!this.canvasComponent.canvas || !this.movingPathData) {
            return;
        }

        if (!this.isInDropContainer(dropContainerData)) {
            return;
        }

        let dragState = this.movingPathData.path.dragState;
        let dropContainer = dropContainerData.dropContainer;
        let oldDropContainer: ContainerComponent | undefined;
        if (dragState.tags.filter((dragTag: string) => dropContainer.acceptedTags.includes(dragTag)).length === 0) {
            return;
        }

        if (!dropContainer.entities.includes(dragState.getEntityId())) {
            dropContainer.entities.push(dragState.getEntityId());

            if (dragState.dropContainerEntityId) {
                oldDropContainer = this.entityContainer.getEntityComponent(dragState.dropContainerEntityId, ContainerComponent)!;
                oldDropContainer.entities.filter((entityId: string) => dragState.getEntityId() !== entityId);
            }
            dragState.dropContainerEntityId = dropContainer.getEntityId();
        }

        this.clearMovingPath();
    }
}
