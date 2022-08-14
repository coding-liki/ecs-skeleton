import React, { Fragment, RefObject } from 'react'
import { Camera, ComponentSystem, Entity, EntityContainer, RerenderEvent, Vector, Viewport } from '../../lib'
import CameraComponent from './CameraComponent'
import { MAIN_CAMERA } from './constants'
import SvgNodeComponent from './SvgNodeComponent'

type Props = {
  entityContainer: EntityContainer,
  systems: ComponentSystem[]
}

type State = {
}

export default class SvgEditor extends React.Component<Props, State> {
  cameraComponent: CameraComponent = new CameraComponent();
  svgNodeComponent: SvgNodeComponent = new SvgNodeComponent;
  cameraEntity?: Entity;

  constructor(props: Props) {
    super(props);
  }

  init = () => {
    this.cameraComponent.camera = new Camera(new Vector(250, 250, -1), new Viewport(new Vector(0, 0), new Vector(500, 500)));

    this.props.entityContainer.getEntitiesByTag(MAIN_CAMERA).forEach(camera => {
      this.props.entityContainer.removeEntity(camera);
    });

    this.cameraEntity = this.props.entityContainer.createEntity([
      this.cameraComponent,
      this.svgNodeComponent
    ], [MAIN_CAMERA]);
  }

  componentDidMount() {
    this.init();

    this.props.systems.map((system) => system.onMount())

    this.props.entityContainer.getEventManager().subscribe(RerenderEvent, this.rerender);
  }

  rerender = (event?: RerenderEvent) => {
    this.forceUpdate()
  }

  componentWillUnmount() {
    this.props.systems.map((system) => system.onUnMount())

    this.props.entityContainer.getEventManager().unsubscribe(RerenderEvent, this.rerender);
  }

  render(): React.ReactNode {
    return (
      <svg
        width={this.cameraComponent?.camera?.initViewPort.dimensions.x}
        height={this.cameraComponent?.camera?.initViewPort.dimensions.y}
        viewBox={this.cameraComponent?.camera?.getViewPort().toString()}
        ref={(svg: SVGSVGElement) => {
          this.svgNodeComponent.svgNode = svg;
        }}
      >
        {this.props.systems.map((system, key) => <Fragment key={key}>{system.render()}</Fragment>)}
      </svg>
    )
  }
}
