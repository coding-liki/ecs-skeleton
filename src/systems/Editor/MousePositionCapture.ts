import { MAIN_CAMERA, MAIN_MOUSE, MouseEventComponent, MousePositionComponent, SvgNodeComponent } from "../../components";
import { ComponentSystem } from "../../lib";

export default class MousePositionCapture extends ComponentSystem {
    mousePositionComponent?: MousePositionComponent;
    mouseEventComponent?: MouseEventComponent;
    svgNodeComponent?: SvgNodeComponent;


    public onMount(): void {
        let mouse = this.entityContainer.getEntityByTag(MAIN_MOUSE);
        let camera = this.entityContainer.getEntityByTag(MAIN_CAMERA);

        this.svgNodeComponent = this.entityContainer.getEntityComponent<SvgNodeComponent>(camera!, SvgNodeComponent);

        this.mousePositionComponent = this.entityContainer.getEntityComponent<MousePositionComponent>(mouse!, MousePositionComponent);
        this.mouseEventComponent = this.entityContainer.getEntityComponent<MouseEventComponent>(mouse!, MouseEventComponent);

        this.addMoveHandler();
    }

    public onUnMount(): void {
        this.removeMoveHandler();
    }

    addMoveHandler() {
        if(!this.svgNodeComponent || !this.svgNodeComponent.svgNode){
            setTimeout(this.addMoveHandler);
            return;
        }
        
        this.svgNodeComponent!.svgNode!.addEventListener('mousemove', this.onMove )
    }
    onMove(event: MouseEvent) {
        console.log("onMove");
        
    }
    
    removeMoveHandler() {
        this.svgNodeComponent!.svgNode!.removeEventListener('mousemove', this.onMove )
    }
}
