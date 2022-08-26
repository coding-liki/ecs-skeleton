import { ReactNode } from "react";
import { CameraComponent, CanvasComponent, MAIN_CAMERA, MAIN_CANVAS, MAIN_MOUSE, MousePositionComponent } from "../../components";
import { Vector } from "../../lib";
import { CanvasViewBox, SCALE_MODE } from "../../lib/Canvas";
import ComponentSystem from "../../lib/ecs/ComponentSystem";

export default class StartCanvasRender extends ComponentSystem {
    private cameraComponent: CameraComponent = new CameraComponent;
    private canvasComponent: CanvasComponent = new CanvasComponent;

    private canvasViewbox?: CanvasViewBox;

    mousePositionComponent: MousePositionComponent = new MousePositionComponent;

    public onMount(): void {
        let camera = this.entityContainer.getEntityByTag(MAIN_CAMERA);
        let canvas = this.entityContainer.getEntityByTag(MAIN_CANVAS);
        let mouse = this.entityContainer.getEntityByTag(MAIN_MOUSE)

        this.mousePositionComponent = this.entityContainer.getEntityComponent<MousePositionComponent>(mouse!, MousePositionComponent)!;
        this.cameraComponent = this.entityContainer.getEntityComponent<CameraComponent>(camera!, CameraComponent)!;
        this.canvasComponent = this.entityContainer.getEntityComponent<CanvasComponent>(canvas!, CanvasComponent)!;
    }

    
    public render(): void {
        if (!this.cameraComponent.camera || !this.canvasComponent.canvas) {
            return;
        }


        let context2d = this.canvasComponent.canvas.getContext('2d');
        if (!context2d) {
            return;
        }

        // console.log("Pre Render canvas ",  this.canvasComponent);
        
        // if(!this.canvasViewbox){
            this.canvasViewbox = new CanvasViewBox(context2d, this.canvasComponent.scaleMode);
        // }

        let width = this.canvasComponent.canvas.width, height = this.canvasComponent.canvas.height;
        context2d.clearRect(0, 0,width, height);
        context2d.save();
        this.canvasViewbox.transformContextMatrix(this.cameraComponent.camera.get2DViewBox());

        // let scaleFactor = this.cameraComponent.camera.position.z / this.cameraComponent.camera.initPosition.z;
        // let viewPort = this.cameraComponent.camera.get2DViewBox();
       

        // context2d.setTransform();
        // -a/2 + 1/2
        context2d.translate( 
            width *(1-this.canvasComponent.upscaleFactor)/2,//)+width/2,//this.canvasComponent.upscaleFactor, 
            height *(1-this.canvasComponent.upscaleFactor)/2//+height/2,//this.canvasComponent.upscaleFactor 
        )

        // context2d.translate( 
        //     // width / 2// 
        //     //+ 
        //     -viewPort.position.x*scaleFactor 
        //     ,//height / 2// 
        //     //+ 
        //     -viewPort.position.y*scaleFactor
        //     )

        // // console.log(viewPort);
        
        // context2d.scale(scaleFactor, scaleFactor)

        // // context2d.translate( 
        // //     -width / 2 //+ this.cameraComponent.camera.position.x*scaleFactor 
        // //     ,-height / 2 // + this.cameraComponent.camera.position.y*scaleFactor
        // //     )

        //     context2d.translate(
        //         // this.cameraComponent.camera.position.x*scaleFactor
        //         // ,this.cameraComponent.camera.position.y*scaleFactor
        //          viewPort.position.x//*scaleFactor//+ this.cameraComponent.camera.position.x///scaleFactor, 
        //          ,viewPort.position.y//*scaleFactor//+ this.cameraComponent.camera.position.y///scaleFactor
        //         )




        // let scaledposition = this.cameraComponent.camera.position.clone().mul(scaleFactor);

        // context2d.translate(-this.cameraComponent.camera.position.x, -this.cameraComponent.camera.position.y);
        // context2d.scale(scaleFactor, scaleFactor);
        // context2d.translate(scaledposition.x, scaledposition.y);
        // context2d.translate(-this.cameraComponent.camera.position.x, -this.cameraComponent.camera.position.y);

        return;
    }
}