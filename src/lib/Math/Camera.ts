import {Vector} from "./Vector";
import {Viewbox} from "./Viewbox";

export interface WithPosition {
    position: Vector;
}

export class Camera implements WithPosition {
    initPosition: Vector;

    constructor(public position: Vector, public initViewBox: Viewbox, initPosition?: Vector) {
        this.initPosition = initPosition ? initPosition : position.clone();
    }

    public zoom = (zoomPoint: Vector, percent: number): Camera => {
        let direction = zoomPoint.clone().sub(this.position);
        let distance = direction.length();

        this.position.plus(direction.norm().mul(distance * percent));

        if (this.position.z > 0) {
            this.position.z = -1;
        }

        return this;
    }

    public move = (dir: Vector, withPosition: WithPosition = this): Camera => {
        let diff = this.position.z / this.initPosition.z;

        withPosition.position.plus(dir.mul(diff));

        return this;
    }

    public get2DViewBox = (): Viewbox => {
        let diff = this.position.z / this.initPosition.z;
        let newDimensions = this.initViewBox.dimensions.clone().mul(diff);
        let newPosition = this.position.clone().sub(newDimensions.clone().div(2));
        newPosition.z = 0;

        return new Viewbox(newPosition, newDimensions);
    }
}