import {SvgPathComponent} from '../../components'
import {
    AddComponentEvent,
    FullRerenderEvent,
    RemoveComponentEvent,
    StartDraggingEvent
} from '../../lib'
import ComponentSystem from '../../lib/ecs/ComponentSystem'

export default class MoveOnTopOnStartDragging extends ComponentSystem {
    private pathComponents: SvgPathComponent[] = [];

    public onMount = (): void => {
        this.subscribe(AddComponentEvent, this.onAddComponent)
            .subscribe(RemoveComponentEvent, this.onRemoveComponent)
            .subscribe(StartDraggingEvent, this.onStartDragging);

        this.getPathsData();
    }

    public onUnMount = (): void => {
        this.unsubscribe(AddComponentEvent, this.onAddComponent)
            .unsubscribe(RemoveComponentEvent, this.onRemoveComponent)
            .subscribe(StartDraggingEvent, this.onStartDragging);
    }

    private onStartDragging = (event: StartDraggingEvent) => {
        let firstPath = this.pathComponents.sort((a, b) => b.zIndex - a.zIndex)[0]!;
        let currentPath: SvgPathComponent = this.entityContainer.getComponentByEntityId(event.entityId, SvgPathComponent)!;

        if (currentPath.getEntityId() !== firstPath.getEntityId()) {
            currentPath.zIndex = firstPath.zIndex + 1;
            this.dispatch(new FullRerenderEvent());
        }
    }

    private onAddComponent = (event: AddComponentEvent) => {
        event.getComponent() instanceof SvgPathComponent ? this.getPathsData() : null;

    }

    private onRemoveComponent = (event: RemoveComponentEvent) => {
        event.getComponent() instanceof SvgPathComponent ? this.getPathsData() : null;
    }

    private getPathsData = () => {
        this.pathComponents = this.entityContainer.getComponents(SvgPathComponent);
    }
}