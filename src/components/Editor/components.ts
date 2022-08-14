import {  Camera, Component, Vector } from '../../lib';

export class CameraComponent extends Component{
    public camera?: Camera;
}

export class SvgNodeComponent extends Component{
    public svgNode?: SVGSVGElement;
}

export class MousePositionComponent extends Component {
    public position: Vector = new Vector;
    public previousPosition: Vector = new Vector;
}

export class MouseEventComponent extends Component {
    public event?: MouseEvent
    public prevoiusEvent?: MouseEvent
}