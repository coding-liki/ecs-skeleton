export interface Coordinates {
    x: number;
    y: number;
    z: number;
}

export class Vector implements Coordinates{
    x: number = 0;
    y: number = 0;
    z: number = 0;

    static sinValues: { [key: string]: number } = {};
    static cosValues: { [key: string]: number } = {};
    static acosValues: { [key: string]: number } = {};
    static atanValues: { [key: string]: number } = {};

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static fromCoordinates(a: Coordinates): Vector  {
        return new Vector(a.x, a.y, a.z);
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    norm(): Vector {
        this.div(this.length());

        return this;
    }

    addXY(x: number, y: number): Vector {
        this.x += x;
        this.y += y;

        return this;
    }

    add(b: Vector): Vector {
        this.x += b.x;
        this.y += b.y;
        this.z += b.z;

        return this;
    }

    subXY(x: number, y: number): Vector {
        this.x -= x;
        this.y -= y;

        return this;
    }

    sub(b: Vector): Vector {
        this.x -= b.x;
        this.y -= b.y;
        this.z -= b.z;

        return this;
    }

    mul(scalar: number): Vector {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;

        return this;
    }

    div(scalar: number): Vector {
        this.x /= scalar;
        this.y /= scalar;
        this.z /= scalar;

        return this;
    }

    rotate(center: Vector, angle: number): Vector {
        let sin = Vector.sin(angle)
        let cos = Vector.cos(angle)

        this.sub(center);

        let newX = this.x * cos - this.y * sin;
        let newY = this.x * sin + this.y * cos;

        this.x = newX;
        this.y = newY;
        this.add(center);

        return this;
    }

    clone(): Vector {
        return new Vector(this.x, this.y, this.z);
    }

    static sin(angle: number): number {
        if (!Vector.sinValues[angle]) {
            Vector.sinValues[angle] = Math.sin(angle);
            Vector.cosValues[angle] = Math.cos(angle);
        }
        return Vector.sinValues[angle];
    }

    static cos(angle: number): number {
        if (!Vector.sinValues[angle]) {
            Vector.sinValues[angle] = Math.sin(angle);
            Vector.cosValues[angle] = Math.cos(angle);
        }
        return Vector.cosValues[angle];
    }

    static acos(value: number): number {
        if (!Vector.acosValues[value]) {
            Vector.acosValues[value] = Math.acos(value);
        }
        return Vector.acosValues[value];
    }

    static atan(value: number): number {
        if (!Vector.atanValues[value]) {
            Vector.atanValues[value] = Math.atan(value);
        }
        return Vector.atanValues[value];
    }
}

