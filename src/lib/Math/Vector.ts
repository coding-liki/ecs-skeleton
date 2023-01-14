export interface Coordinates {
    x: number;
    y: number;
    z: number;
}

type Div = {
    (vector: Coordinates): Vector;
    (scalar: number): Vector;
};

type ObjectOrCords = {
    (b: Coordinates): Vector;
    (x: number, y: number): Vector;
    (x: number, y: number, z: number): Vector;
}

export class Vector implements Coordinates {
    static sinValues: { [key: string]: number } = {};
    static cosValues: { [key: string]: number } = {};
    static acosValues: { [key: string]: number } = {};
    static atanValues: { [key: string]: number } = {};

    constructor(public x: number = 0, public y: number = 0, public z: number = 0) {
    }

    public static fromCoordinates = (a: Coordinates): Vector => new Vector(a.x, a.y, a.z);

    public length = (): number => Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

    public norm = (): Vector => this.div(this.length());

    public plus: ObjectOrCords = (x: number | Coordinates, y?: number, z?: number): Vector => {
        if (typeof x === "number") {
            this.x += x;
            this.y += y ? y : 0;
            this.z += z ? z : 0;
        } else {
            this.x += x.x;
            this.y += x.y;
            this.z += x.z;
        }

        return this;
    }

    public sub: ObjectOrCords = (x: number | Coordinates, y?: number, z?: number): Vector => {
        if (typeof x === "number") {
            this.x -= x;
            this.y -= y ? y : 0;
            this.z -= z ? z : 0;
        } else {
            this.x -= x.x;
            this.y -= x.y;
            this.z -= x.z;
        }

        return this;
    }

    public mul = (scalar: number): Vector => {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;

        return this;
    }


    public div: Div = (operand: number | Coordinates): Vector => {
        if (typeof operand !== 'number') {
            this.x /= this.oneIfZero(operand.x);
            this.y /= this.oneIfZero(operand.y);
            this.z /= this.oneIfZero(operand.z);
        } else {
            operand = this.oneIfZero(operand);
            this.x /= operand;
            this.y /= operand;
            this.z /= operand;
        }
        return this;
    }

    private oneIfZero = (toCheck: number): number => toCheck === 0 ? 1 : toCheck;

    public rotate = (center: Vector, angle: number): Vector => {
        let sin = Vector.sin(angle)
        let cos = Vector.cos(angle)

        this.sub(center);

        let newX = this.x * cos - this.y * sin;
        let newY = this.x * sin + this.y * cos;

        this.x = newX;
        this.y = newY;
        this.plus(center);

        return this;
    }

    public clone = (): Vector => new Vector(this.x, this.y, this.z);

    public static sin = (angle: number): number => {
        if (!Vector.sinValues[angle]) {
            Vector.sinValues[angle] = Math.sin(angle);
            Vector.cosValues[angle] = Math.cos(angle);
        }
        return Vector.sinValues[angle];
    }

    public static cos = (angle: number): number => {
        if (!Vector.sinValues[angle]) {
            Vector.sinValues[angle] = Math.sin(angle);
            Vector.cosValues[angle] = Math.cos(angle);
        }
        return Vector.cosValues[angle];
    }

    public static acos = (value: number): number => {
        if (!Vector.acosValues[value]) {
            Vector.acosValues[value] = Math.acos(value);
        }
        return Vector.acosValues[value];
    }

    public static atan = (value: number): number => {
        if (!Vector.atanValues[value]) {
            Vector.atanValues[value] = Math.atan(value);
        }
        return Vector.atanValues[value];
    }
}

