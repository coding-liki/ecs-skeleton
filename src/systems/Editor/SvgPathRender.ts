import {
    CanvasComponent, MAIN_CANVAS, SvgPathComponent, PositionComponent,
} from '../../components'
import {AddComponentEvent, RemoveComponentEvent} from '../../lib'
import ComponentSystem from '../../lib/ecs/ComponentSystem'

type PathData = {
    path: SvgPathComponent
    position: PositionComponent
};

export default class SvgPathRender extends ComponentSystem {
    private canvasComponent: CanvasComponent = new CanvasComponent;
    private context?: CanvasRenderingContext2D;

    private pathsData: PathData[] = [];

    public onMount = (): void => {
        let canvas = this.entityContainer.getEntityByTag(MAIN_CANVAS)!;
        this.initComponentField("canvasComponent", canvas);

        this.subscribe(AddComponentEvent, this.onAddComponent)
            .subscribe(RemoveComponentEvent, this.onRemoveComponent);

        this.getPathsData();
    }

    public onUnMount = (): void => {
        this.unsubscribe(AddComponentEvent, this.onAddComponent)
            .unsubscribe(RemoveComponentEvent, this.onRemoveComponent);
    }

    private onAddComponent = (event: AddComponentEvent): void => {
        event.getComponent() instanceof SvgPathComponent ? this.getPathsData() : null;
    }

    private onRemoveComponent = (event: RemoveComponentEvent): void => {
        event.getComponent() instanceof SvgPathComponent ? this.getPathsData() : null;
    }

    private getPathsData = (): void => {
        let paths: SvgPathComponent[] = this.entityContainer.getComponents(SvgPathComponent);
        this.pathsData = [];

        paths.forEach((path: SvgPathComponent) => {
            let position: PositionComponent = this.entityContainer.getEntityComponent(path.getEntityId(), PositionComponent)!;
            this.pathsData.push({
                path: path,
                position: position
            });
        });
    }

    public render = (): void => {
        if (!this.canvasComponent.canvas) {
            return;
        }

        this.context = this.canvasComponent.canvas.getContext('2d')!;

        this.pathsData.sort((a, b) => {
            return a.path.zIndex - b.path.zIndex;
        }).forEach(this.drawPath);
    }

    private drawPath = (pathData: PathData): void => {
        if (!this.context) {
            return;
        }

        this.context.beginPath();
        let path2d = new Path2D();
        path2d.addPath(new Path2D(pathData.path.path), {
            e: pathData.position.coordinates.x,
            f: pathData.position.coordinates.y
        });

        this.context.fillStyle = pathData.path.fillStyle;
        this.context.strokeStyle = pathData.path.strokeStyle;

        this.context.fill(path2d);
        this.context.lineWidth = pathData.path.strokeWidth;

        this.context.stroke(path2d);
    }
}
