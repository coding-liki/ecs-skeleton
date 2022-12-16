import React from "react";
import { ReactNode } from "react";
import { CameraComponent, CanvasComponent, MAIN_CAMERA, MAIN_CANVAS } from "../../components";
import { ComponentSystem } from "../../lib";

export default class RenderCanvas extends ComponentSystem {
    private canvasComnponent: CanvasComponent = new CanvasComponent
    private cameraComponent: CameraComponent = new CameraComponent;

    public onMount(): void {
        let camera = this.entityContainer.getEntityByTag(MAIN_CAMERA);
        
        this.cameraComponent = this.entityContainer.getEntityComponent<CameraComponent>(camera!, CameraComponent)!;

        this.refillCanvas();
    }

    public refillCanvas = () => {
        this.entityContainer.removeEntitiesWithTag(MAIN_CANVAS);
        
        this.entityContainer.createEntity([
            this.canvasComnponent
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
            width={this.cameraComponent.camera?.initViewBox.dimensions.x/this.canvasComnponent.upscaleFactor}
            height={this.cameraComponent.camera?.initViewBox.dimensions.y/this.canvasComnponent.upscaleFactor}
            ref={(canvas: HTMLCanvasElement) => {
                this.canvasComnponent.canvas = canvas;
            }}  
        ></canvas>
    }
}