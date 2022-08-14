import { Vector } from "./Vector";


export class Viewport {
    position: Vector;

    dimensions: Vector;

    constructor(position: Vector, dimensions: Vector) {
        this.position = position;
        this.dimensions = dimensions;
    }

    toString(): string {
        return this.position.x + ", " + this.position.y + ", " + this.dimensions.x + ", " + this.dimensions.y;
    }
}