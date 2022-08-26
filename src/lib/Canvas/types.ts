import { Vector } from "../Math"

export type AspectRatio = {
    dimensions: Vector,
    ratio: number
}

export enum SCALE_MODE{
    fix,
    fit
}