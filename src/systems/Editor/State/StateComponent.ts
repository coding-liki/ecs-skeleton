import { Component } from "../../../lib";

export interface StateInterface {
    isActive(): boolean;
    on(): void;
    off(): void;
}
export default class StateComponent extends Component implements StateInterface {
    private active: boolean = false;

    public isActive(): boolean {
        return this.active;
    }

    public on(): void {
        this.active = true;
    }

    public off(): void {
        this.active = false;
    }
}