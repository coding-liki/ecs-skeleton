import {Camera, Component, Vector} from '../../lib';

export class CameraComponent extends Component {
    public camera?: Camera;
}

export class PositionComponent extends Component {
    public coordinates: Vector = new Vector();
}

export class HtmlElementComponent extends Component {
    public element?: HTMLElement;
}
