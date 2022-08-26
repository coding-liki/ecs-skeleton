import { Camera, Component, Vector } from '../../lib';
import { SCALE_MODE } from '../../lib/Canvas';


export class CameraComponent extends Component {
    public camera?: Camera;
}
export class CanvasComponent extends Component {
    public canvas?: HTMLCanvasElement;
    
    public scaleMode: SCALE_MODE = SCALE_MODE.fit;

    public upscaleFactor = 1.2;
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
    public prevoiusEvent?: MouseEvent
}