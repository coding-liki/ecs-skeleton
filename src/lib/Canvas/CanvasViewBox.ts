import { Vector, Viewbox } from "../Math";
import { AspectRatio, SCALE_MODE } from "./types";

export default class CanvasViewBox {
    private context: CanvasRenderingContext2D;
    private scaleMode: SCALE_MODE;

    constructor(context: CanvasRenderingContext2D, scaleMode: SCALE_MODE) {
        this.context = context;
        this.scaleMode = scaleMode;

    }

    private calculateAspectRatio(sourceDimensions: Vector, maxDimensions: Vector): AspectRatio {
        let ratio;

        if (this.scaleMode === SCALE_MODE.fit) {
            ratio = Math.min(maxDimensions.x / sourceDimensions.x, maxDimensions.y / sourceDimensions.y);
        } else {
            ratio = Math.max(maxDimensions.x / sourceDimensions.x, maxDimensions.y / sourceDimensions.y);
        }

        return {
            dimensions: new Vector(sourceDimensions.x * ratio, sourceDimensions.y * ratio),
            ratio: ratio,
        };
    }

    public transformContextMatrix( viewBox: Viewbox, resolution: number = 1 ) {
      
        let {
          width: canvasWidth,
          height: canvasHeight,
        } = this.context.canvas.getBoundingClientRect();
      
        let canvasDimensions = new Vector(canvasWidth, canvasHeight);
        canvasDimensions.mul(resolution);
        
      
        const aspectRatio = this.calculateAspectRatio(
            viewBox.dimensions,
            canvasDimensions
        );
      
        const scaleX = aspectRatio.dimensions.x / viewBox.dimensions.x;
        const scaleY = aspectRatio.dimensions.y / viewBox.dimensions.y;
      
        let translate = viewBox.position.clone().mul(-aspectRatio.ratio).add(canvasDimensions.sub(aspectRatio.dimensions).div(2));
        
        this.context.setTransform(scaleX, 0, 0, scaleY, translate.x, translate.y);
      
      }
      


} 