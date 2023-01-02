import {Camera, Component, Entity, Vector} from '../../lib';
import {SCALE_MODE} from '../../lib/Canvas';


export class CameraComponent extends Component {
    public camera?: Camera;
}

export class CanvasComponent extends Component {
    public canvas?: HTMLCanvasElement;

    public scaleMode: SCALE_MODE = SCALE_MODE.fit;

    public upscaleFactor = 1.2;
}

export class PositionComponent extends Component {
    public coordinates: Vector = new Vector();
}

export class HtmlElementComponent extends Component {
    public element?: HTMLElement;
}

export class MousePositionComponent extends Component {
    public position: Vector = new Vector;
    public previousPosition: Vector = new Vector;
}

export class MouseEventComponent extends Component {
    public event?: MouseEvent
    public previousEvent?: MouseEvent
}

export class SvgPathComponent extends Component {
    public path: string = "";
    public fillStyle: string | CanvasGradient | CanvasPattern = "black";
    public strokeStyle: string | CanvasGradient | CanvasPattern = "black";
    public strokeWidth: number = 4;
}

export enum DragState {
    NOT_DRAGGING,
    DRAGGING
}

export class DraggableComponent extends Component {
    public state: DragState = DragState.NOT_DRAGGING;
    public tags: string[] = [];
    public dropContainerEntityId?: string;
}

export class DropContainerComponent extends Component {
    public entities: string[] = [];
    public acceptedTags: string[] = [];
}