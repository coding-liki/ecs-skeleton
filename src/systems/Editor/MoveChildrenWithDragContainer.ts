import ComponentSystem from "../../lib/ecs/ComponentSystem";
import {
    DraggingEvent,
    StartDraggingEvent, StopDraggingEvent,
    Vector
} from "../../lib";
import {ContainerComponent, PositionComponent} from "../../components";

type MovingRelativePosition = {
    entityId: string
    relativePosition: Vector
};

export default class MoveChildrenWithDragContainer extends ComponentSystem {
    private movingStartPositions: MovingRelativePosition[] = [];
    private dragEntityPosition: Vector = new Vector();
    private currentEntityPosition: Vector = new Vector();

    public onMount = (): void => {
        this
            .subscribe(DraggingEvent, this.onDragging)
            .subscribe(StopDraggingEvent, this.onStopDragging)
            .subscribe(StartDraggingEvent, this.onStartDragging);
    }

    public onUnMount = (): void => {
        this
            .unsubscribe(DraggingEvent, this.onDragging)
            .unsubscribe(StopDraggingEvent, this.onStopDragging)
            .unsubscribe(StartDraggingEvent, this.onStartDragging);
    }

    private onStartDragging = (event: StartDraggingEvent) => {
        this.movingStartPositions = [];
        let position: PositionComponent = this.entityContainer.getComponentByEntityId(event.entityId, PositionComponent)!;

        this.dragEntityPosition = position.coordinates.clone();

        this.saveEntityComponentPositions(event.entityId, event);
    }

    private onStopDragging = (event: StopDraggingEvent) => {
        this.movingStartPositions = [];
        this.dragEntityPosition = new Vector();
    }

    private onDragging = (event: DraggingEvent) => {
        let position: PositionComponent = this.entityContainer.getComponentByEntityId(event.entityId, PositionComponent)!;
        this.currentEntityPosition = position.coordinates;

        this.movingStartPositions.forEach(this.moveChild);
    }

    private saveEntityComponentPositions = (entityId: string, event: StartDraggingEvent) => {
        if (entityId !== event.entityId) {
            let position: PositionComponent = this.entityContainer.getComponentByEntityId(entityId, PositionComponent)!;

            this.movingStartPositions.push({
                entityId: entityId,
                relativePosition: this.dragEntityPosition.clone().sub(position.coordinates)
            });
        }

        let container: ContainerComponent|undefined = this.entityContainer.getComponentByEntityId(entityId, ContainerComponent);
        if(container) {
            container.entities.forEach((childId) => {
                this.saveEntityComponentPositions(childId, event);
            });
        }
    }

    private moveChild = (relativePosition: MovingRelativePosition) => {
        let childPosition: PositionComponent = this.entityContainer.getComponentByEntityId(relativePosition.entityId, PositionComponent)!;

        let coordinates = childPosition.coordinates;

        coordinates.x = 0;
        coordinates.y = 0;

        coordinates.plus(this.currentEntityPosition).sub(relativePosition.relativePosition);
    }
}