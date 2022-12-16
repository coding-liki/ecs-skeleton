import React from "react";
import { ReactNode } from "react";
import { CameraComponent, CanvasComponent, MAIN_CAMERA, MAIN_CANVAS } from "../../components";
import { ComponentSystem } from "../../lib";

export default class RenderCanvas extends ComponentSystem {
    private canvasComponent: CanvasComponent = new CanvasComponent
    private cameraComponent: CameraComponent = new CameraComponent;

    public onMount(): void {
        let camera = this.entityContainer.getEntityByTag(MAIN_CAMERA);
        
        this.cameraComponent = this.entityContainer.getEntityComponent<CameraComponent>(camera!, CameraComponent)!;

        this.refillCanvas();
    }

    public refillCanvas = () => {
        this.entityContainer.removeEntitiesWithTag(MAIN_CANVAS);
        
        this.entityContainer.createEntity([
            this.canvasComponent
        ], [MAIN_CANVAS]);
    }
    reactRender = (): ReactNode => {
        if(!this.cameraComponent.camera){

            return ;
        }
        

        return <canvas
            style={{
                width: this.cameraComponent.camera?.initViewBox.dimensions.x+"px",
                height: this.cameraComponent.camera?.initViewBox.dimensions.y+"px"
            }}
            width={this.cameraComponent.camera?.initViewBox.dimensions.x/this.canvasComponent.upscaleFactor}
            height={this.cameraComponent.camera?.initViewBox.dimensions.y/this.canvasComponent.upscaleFactor}
            ref={(canvas: HTMLCanvasElement) => {
                this.canvasComponent.canvas = canvas;
            }}  
        ></canvas>
    }
}