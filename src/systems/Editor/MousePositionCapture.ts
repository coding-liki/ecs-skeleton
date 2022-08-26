import {
  CameraComponent,
  MAIN_CAMERA,
  MAIN_MOUSE,
  MouseEventComponent,
  MousePositionComponent,
  HtmlElementComponent,
} from '../../components'
import { Vector } from '../../lib'
import ComponentSystem from '../../lib/ecs/ComponentSystem'

export default class MousePositionCapture extends ComponentSystem {
  mousePositionComponent: MousePositionComponent = new MousePositionComponent
  mouseEventComponent: MouseEventComponent = new MouseEventComponent
  htmlElementComponent: HtmlElementComponent = new HtmlElementComponent
  cameraComponent: CameraComponent = new CameraComponent

  public onMount(): void {
    let mouse = this.entityContainer.getEntityByTag(MAIN_MOUSE)
    let camera = this.entityContainer.getEntityByTag(MAIN_CAMERA)

    this.htmlElementComponent =
      this.entityContainer.getEntityComponent<HtmlElementComponent>(
        camera!,
        HtmlElementComponent
      )!

    this.mousePositionComponent =
      this.entityContainer.getEntityComponent<MousePositionComponent>(
        mouse!,
        MousePositionComponent
      )!

    this.mouseEventComponent =
      this.entityContainer.getEntityComponent<MouseEventComponent>(
        mouse!,
        MouseEventComponent
      )!

    this.cameraComponent =
      this.entityContainer.getEntityComponent<CameraComponent>(
        camera!,
        CameraComponent
      )!

    this.addMoveHandler()
  }

  public onUnMount(): void {
    this.removeMoveHandler()
  }

  addMoveHandler() {
    if (!this.htmlElementComponent.element) {
      setTimeout(this.addMoveHandler)
      return
    }

    this.htmlElementComponent.element.addEventListener('mousemove', this.onMove)
  }
  onMove = (event: MouseEvent) => {
    if(this.mouseEventComponent.event){
      this.mouseEventComponent.prevoiusEvent = this.mouseEventComponent?.event
    }
    
    this.mouseEventComponent.event = event;

    if (
      !this.cameraComponent.camera ||
      !this.htmlElementComponent.element
    ) {
      console.log("No components");
       
      return
    }

    this.mousePositionComponent.previousPosition =
      this.mousePositionComponent.position.clone()

    let computedStyle = getComputedStyle(this.htmlElementComponent.element)
    
    let editorRect = this.htmlElementComponent.element.getBoundingClientRect()
    let initViewport =  this.cameraComponent.camera.initViewBox;
    let currentViewport =  this.cameraComponent.camera.get2DViewBox();

    let widthRatio =
     initViewport.dimensions.x /
      currentViewport.dimensions.x;

    let heightRatio =
      initViewport.dimensions.y /
      currentViewport.dimensions.y

    this.mousePositionComponent.position = new Vector(
      this.mouseEventComponent.event.clientX -
        editorRect.left -
        parseFloat(computedStyle.borderLeftWidth),
      this.mouseEventComponent.event.clientY -
        editorRect.top -
        parseFloat(computedStyle.borderTopWidth)
    )

    this.mousePositionComponent.position.x /= widthRatio
    this.mousePositionComponent.position.y /= heightRatio

    this.mousePositionComponent.position.add(
      currentViewport.position
    )
  }

  removeMoveHandler() {
    if(!this.htmlElementComponent.element){
      return;
    }

    this.htmlElementComponent.element.removeEventListener(
      'mousemove',
      this.onMove
    )
  }
}
