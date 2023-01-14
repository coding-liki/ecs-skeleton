import {Vector, Viewbox} from "../Math";
import {AspectRatio, SCALE_MODE} from "./types";

export default class CanvasViewBox {
    constructor(private context: CanvasRenderingContext2D, private scaleMode: SCALE_MODE) {
    }

    private calculateAspectRatio = (sourceDimensions: Vector, maxDimensions: Vector): AspectRatio => {
        let ratio = 1;

        let dimRatio = maxDimensions.clone().div(sourceDimensions);

        if (this.scaleMode === SCALE_MODE.fit) {
            ratio = Math.min(dimRatio.x, dimRatio.y);
        } else {
            ratio = Math.max(dimRatio.x, dimRatio.y);
        }

        return {
            dimensions: sourceDimensions.clone().mul(ratio),
            ratio: ratio,
        };
    }

    public transformContextMatrix = (viewBox: Viewbox, resolution: number = 1) => {
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

        const scale = aspectRatio.dimensions.clone().div(viewBox.dimensions);

        let translate = viewBox.position.clone().mul(-aspectRatio.ratio).plus(canvasDimensions.sub(aspectRatio.dimensions).div(2));

        this.context.setTransform(scale.x, 0, 0, scale.y, translate.x, translate.y);
    }
} 