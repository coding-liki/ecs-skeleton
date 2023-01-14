import React from 'react'
import {ComponentStory, ComponentMeta} from '@storybook/react'
import {
    CanvasComponent, DraggableComponent, ContainerComponent,
    EcsEditor,
    MAIN_CANVAS,
    MAIN_MOUSE,
    MousePositionComponent, PositionComponent, SvgPathComponent
} from '../components'
import {
    AddComponentEvent,
    Component,
    ComponentSystem,
    EndedRenderEvent,
    EntityContainer,
    FullRerenderEvent,
    RerenderEvent,
    SystemContainer,
    TurnOffSystemByClass,
    TurnOnSystemByClass, Vector,
} from '../lib'
import {
    EndCanvasRender,
    FixCameraOnWindowResize,
    MousePositionCapture, MoveOnTopOnStartDragging,
    RenderCanvas,
    StartCanvasRender
} from '../systems'
import ZoomOnWheel from '../systems/Editor/ZoomOnWheel'
import SvgPathRender from "../systems/Editor/SvgPathRender";
import DragAndDrop, {DROP_GLOBAL} from "../systems/Editor/DragAndDrop";
import MoveChildrenWithDragContainer from "../systems/Editor/MoveChildrenWithDragContainer";

// Component Classes
class Position extends Component {
    public x: number = 0
    public y: number = 0
}

class Color extends Component {
    public fill: string = 'red'
}

class Radius extends Component {
    public radius: number = 10
}

class DrawCircle extends Component {
}

class DomNode extends Component {
    public node: any
}

class FrameRate extends Component {
    public ms: number = 0;
    public lastMs: number = 0;
}

// System Classes

class RenderCircle extends ComponentSystem {
    private canvasComponent: CanvasComponent = new CanvasComponent;
    private context?: CanvasRenderingContext2D;
    private drawFlags: DrawCircle[] = [];
    private drawComponents: { [key: string]: { position: Position, radius: Radius, color: Color } } = {};

    public onMount = (): void => {
        let canvas = this.entityContainer.getEntityByTag(MAIN_CANVAS);

        this.canvasComponent = this.entityContainer.getEntityComponent<CanvasComponent>(canvas!, CanvasComponent)!;

        this.entityContainer
            .getEventManager()
            .subscribe(AddComponentEvent, this.onAddComponent)

        this.getCircleComponents();

    }

    public onUnMount = (): void => {
        this.entityContainer
            .getEventManager()
            .unsubscribe(AddComponentEvent, this.onAddComponent)
    }

    onAddComponent = (event: AddComponentEvent) => {

        if (event.getComponent() instanceof DrawCircle) {

            console.log("Added Circle");

            this.drawFlags = this.entityContainer.getComponents<DrawCircle>(DrawCircle);
            this.getCircleComponents();

            this.entityContainer.getEventManager().dispatch(new FullRerenderEvent())
        }
    }

    render = (): void => {
        if (!this.canvasComponent.canvas) {
            return;
        }

        // if (!this.context) {
        this.context = this.canvasComponent.canvas.getContext('2d')!//, { alpha: false })!;
        // }

        this.drawFlags.forEach(this.drawCircle);

        return;//
    }

    drawCircle = (flag: DrawCircle, key: number): void => {

        let components = this.drawComponents[flag.getEntityId()];
        if (!components || !this.context) {

            return;
        }

        // let position = this.entityContainer.getComponentByEntityId<Position>(
        //   flag.getEntityId(),
        //   Position
        // )
        // let radius = this.entityContainer.getComponentByEntityId<Radius>(
        //   flag.getEntityId(),
        //   Radius
        // )
        // let color = this.entityContainer.getComponentByEntityId<Color>(
        //   flag.getEntityId(),
        //   Color
        // )
        // if (!position || !radius || !color || !this.context) {
        //   return;
        // }

        this.context.beginPath();
        this.context.arc(Math.floor(components.position.x), Math.floor(components.position.y), components.radius.radius, 0, 2 * Math.PI, false);
        this.context.fillStyle = components.color.fill;
        // this.context.lineWidth = 5;
        // this.context.strokeStyle = '#003300';
        // this.context.stroke();
        this.context.fill();

        return;
    }

    private getCircleComponents() {
        this.drawComponents = {};
        this.drawFlags.forEach((flag: DrawCircle) => {
            let position = this.entityContainer.getComponentByEntityId<Position>(
                flag.getEntityId(),
                Position
            )
            let radius = this.entityContainer.getComponentByEntityId<Radius>(
                flag.getEntityId(),
                Radius
            )
            let color = this.entityContainer.getComponentByEntityId<Color>(
                flag.getEntityId(),
                Color
            )
            if (!position || !radius || !color) {
                return;
            }

            this.drawComponents[flag.getEntityId()] = {
                position: position,
                color: color,
                radius: radius
            }
        })
    }
}

class RenderMousePosition extends ComponentSystem {
    mousePositionComponent: MousePositionComponent = new MousePositionComponent

    private canvasComponent: CanvasComponent = new CanvasComponent;
    private context?: CanvasRenderingContext2D;

    public onMount = (): void => {
        let canvas = this.entityContainer.getEntityByTag(MAIN_CANVAS);
        let mouse = this.entityContainer.getEntityByTag(MAIN_MOUSE)

        this.canvasComponent = this.entityContainer.getEntityComponent<CanvasComponent>(canvas!, CanvasComponent)!;

        this.mousePositionComponent =
            this.entityContainer.getEntityComponent<MousePositionComponent>(
                mouse!,
                MousePositionComponent
            )!
    }

    render = (): void => {
        if (!this.canvasComponent.canvas) {
            return;
        }

        // if (!this.context) {
        this.context = this.canvasComponent.canvas.getContext('2d')!//, { alpha: false })!;
        // }
        this.context.beginPath();
        this.context.arc(Math.floor(this.mousePositionComponent.position.x), Math.floor(this.mousePositionComponent.position.y), 10, 0, 2 * Math.PI, false);
        this.context.fillStyle = "red";
        // this.context.lineWidth = 5;
        // this.context.strokeStyle = '#003300';
        // this.context.stroke();
        this.context.fill();
        return;//
    }
}

class MoveCircles extends ComponentSystem {
    positionComponents: Position[] = []

    public onMount = (): void => {
        this.positionComponents =
            this.entityContainer.getComponents<Position>(Position)
        setInterval(this.move)

        this.entityContainer
            .getEventManager()
            .subscribe(AddComponentEvent, this.onAddComponent)
    }

    onAddComponent = (event: AddComponentEvent) => {
        this.positionComponents =
            this.entityContainer.getComponents<Position>(Position)
    }

    move = () => {
        if (!this.isActive()) {
            return;
        }
        this.positionComponents.forEach((position) => {
            position.x += Math.random() - 0.5
            position.y += Math.random() - 0.5
        })

        this.entityContainer.getEventManager().dispatch(new RerenderEvent())
    }
}

const FRAME_RATE = 'FRAME_RATE'

class FrameRateCalculatorAndRenderer extends ComponentSystem {
    private frameRateComponent: FrameRate = new FrameRate;
    private canvasComponent: CanvasComponent = new CanvasComponent;
    private maxRate = 0;
    private minRate = 1000000;
    private frameCount = 0;

    public onMount = (): void => {
        let canvas = this.entityContainer.getEntityByTag(MAIN_CANVAS);

        this.canvasComponent = this.entityContainer.getEntityComponent<CanvasComponent>(canvas!, CanvasComponent)!;

        this.refillFrameRate()

        this.entityContainer.getEventManager().subscribe(EndedRenderEvent, this.onRerender)
    }

    onRerender = (event: EndedRenderEvent) => {
        if (!this.frameRateComponent) {
            return;
        }

        this.frameRateComponent.lastMs = this.frameRateComponent.ms;
        this.frameRateComponent.ms = window.performance.now();
    }

    public refillFrameRate() {
        this.entityContainer.getEntitiesByTag(FRAME_RATE).forEach((entity) => {
            this.entityContainer.removeEntity(entity)
        })

        this.frameRateComponent = new FrameRate;

        this.entityContainer.createEntity([this.frameRateComponent], [FRAME_RATE])
    }

    public render = (): void => {
        this.frameCount++;
        if (this.frameCount % 300 === 0) {
            this.frameCount = 0;
            this.minRate = 100000;
            this.maxRate = 0;
        }
        if (!this.canvasComponent.canvas) {
            return
        }


        let rate = 1000 / (this.frameRateComponent.ms - this.frameRateComponent.lastMs)
        if (rate < this.minRate) {
            this.minRate = rate;
        }
        if (rate > this.maxRate) {
            this.maxRate = rate
        }
        let context = this.canvasComponent.canvas.getContext('2d')!;

        context.font = '48px serif';
        context.fillStyle = "black";
        context.fillText(rate + "", -20, 0);
        context.fillText(this.minRate + "", -20, 50);
        context.fillText(this.maxRate + "", -20, 100);

        return;
    }
}

class LeftButtonsContainer extends ComponentSystem {
    public reactRender = (): React.ReactNode => {
        return <div style={{
            width: '100px',
            flexShrink: 0,
            background: "black"
        }}>
            <button onClick={() => addCircles(this.entityContainer)}>AddCircles</button>
        </div>;
    }
}

class StopRenderCirclesButtonContainer extends ComponentSystem {
    off = false;
    move = false;

    public reactRender = (): React.ReactNode => {
        return <div style={{
            width: '100px',
            flexShrink: 0,
            background: "black"
        }}>
            <button onClick={() => addCircles(this.entityContainer)}>AddCircles</button>
            <button onClick={() => {
                this.off = !this.off;
                if (!this.off) {
                    this.entityContainer.getEventManager().dispatch(new TurnOnSystemByClass(RenderCircle))
                } else {
                    this.entityContainer.getEventManager().dispatch(new TurnOffSystemByClass(RenderCircle))
                }
                this.entityContainer.getEventManager().dispatch(new RerenderEvent())
            }}>Toggle Render Circle
            </button>

            <button onClick={() => {
                this.move = !this.move;
                if (this.move) {
                    this.entityContainer.getEventManager().dispatch(new TurnOnSystemByClass(MoveCircles))
                } else {
                    this.entityContainer.getEventManager().dispatch(new TurnOffSystemByClass(MoveCircles))
                }
                this.entityContainer.getEventManager().dispatch(new RerenderEvent())
            }}>Toggle Move Circles
            </button>
        </div>;
    }
}

////////////////////////////

export default {
    title: 'Editor/SvgEditor',
    component: EcsEditor,
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
        layout: 'fullscreen',
    },
} as ComponentMeta<typeof EcsEditor>

const Template: ComponentStory<typeof EcsEditor> = (args) => (
    <EcsEditor {...args} />
)

export const EmptyRender = Template.bind({});
let entityContainerEmpty = new EntityContainer("empty")

EmptyRender.args = {
    entityContainer: entityContainerEmpty,
    systemContainer: (new SystemContainer(entityContainerEmpty))
        .initSystem(RenderCanvas)
        .initSystem(StartCanvasRender)
        .initSystem(EndCanvasRender)
}

export const RenderAndWindowResize = Template.bind({})
let entityContainerSimpleRender = new EntityContainer("SimpleRender")

RenderAndWindowResize.args = {
    entityContainer: entityContainerSimpleRender,
    systemContainer: (new SystemContainer(entityContainerSimpleRender))
        .initSystem(RenderCanvas)
        .initSystem(StartCanvasRender)
        .initSystem(RenderCircle)
        .initSystem(EndCanvasRender)
        .initSystem(FixCameraOnWindowResize)
}

export const WithLeftContainer = Template.bind({})

let entityContainerLeftContainer = new EntityContainer("LeftContainer")
WithLeftContainer.args = {
    entityContainer: entityContainerLeftContainer,
    systemContainer: (new SystemContainer(entityContainerLeftContainer))
        .initSystem(LeftButtonsContainer)
        .initSystem(RenderCanvas)
        .initSystem(StartCanvasRender)
        .initSystem(RenderCircle)
        .initSystem(EndCanvasRender)
        .initSystem(FixCameraOnWindowResize)
}

export const StopRenderCirclesContainer = Template.bind({})
let entityContainerStopRender = new EntityContainer("StopRender")

StopRenderCirclesContainer.args = {
    entityContainer: entityContainerStopRender,
    systemContainer: (new SystemContainer(entityContainerStopRender))
        .initSystem(StopRenderCirclesButtonContainer)
        .initSystem(RenderCanvas)
        .initSystem(StartCanvasRender)
        .initSystem(RenderCircle)
        .initSystem(MousePositionCapture)
        .initSystem(ZoomOnWheel)
        .initSystem(RenderMousePosition)
        .initSystem(EndCanvasRender)
        .initSystem(FixCameraOnWindowResize)
}


// export const RenderAndWindowResizeAndZoom = Template.bind({})
export const MovingCircles = Template.bind({})
let entityContainerMovingCircles = new EntityContainer("MovingCircles")

MovingCircles.args = {
    entityContainer: entityContainerMovingCircles,
    systemContainer: (new SystemContainer(entityContainerMovingCircles))
        .initSystem(StopRenderCirclesButtonContainer)
        .initSystem(RenderCanvas)
        .initSystem(StartCanvasRender)
        .initSystem(RenderCircle)
        .initSystem(EndCanvasRender)
        .initSystem(FixCameraOnWindowResize)
        .initSystem(MoveCircles)
}


export const SvgRender = Template.bind({});
let entityContainerSvgRender = new EntityContainer("svgRender")

SvgRender.args = {
    entityContainer: entityContainerSvgRender,
    systemContainer: (new SystemContainer(entityContainerSvgRender))
        .initSystem(LeftButtonsContainer)
        .initSystem(RenderCanvas)
        .initSystem(StartCanvasRender)
        .initSystem(MousePositionCapture)
        .initSystem(ZoomOnWheel)
        .initSystem(SvgPathRender)
        .initSystem(EndCanvasRender)
        .initSystem(FixCameraOnWindowResize)
}

export const DragAndDropTemplate = Template.bind({});
let entityContainerDragAndDrop = new EntityContainer("dragAndDrop")

DragAndDropTemplate.args = {
    entityContainer: entityContainerDragAndDrop,
    systemContainer: (new SystemContainer(entityContainerDragAndDrop))
        .initSystem(LeftButtonsContainer)
        .initSystem(RenderCanvas)
        .initSystem(StartCanvasRender)
        .initSystem(MousePositionCapture)
        .initSystem(ZoomOnWheel)
        .initSystem(SvgPathRender)
        .initSystem(DragAndDrop)
        .initSystem(MoveOnTopOnStartDragging)
        .initSystem(MoveChildrenWithDragContainer)
        .initSystem(EndCanvasRender)
        .initSystem(FixCameraOnWindowResize)
}


let rectPath = new SvgPathComponent();
rectPath.path = "m0,0 100,0 0,-100 -100,0 z";
rectPath.fillStyle = "yellow";
rectPath.zIndex = 1;

rectPath.strokeWidth = 2;

let dropContainer = new ContainerComponent();
let draggable = new DraggableComponent();

draggable.tags = [DROP_GLOBAL];

dropContainer.acceptedTags = ["dropRedCircle"];

entityContainerDragAndDrop.createEntity([
    new PositionComponent(),
    rectPath,
    dropContainer,
    draggable
])


rectPath = new SvgPathComponent();
rectPath.path = "m0,0 100,0 0,-100 -100,0 z";
rectPath.fillStyle = "blue";

rectPath.strokeWidth = 2;

dropContainer = new ContainerComponent();

dropContainer.acceptedTags = ["dropGreenCircle"];
let contPosition = new PositionComponent();

contPosition.coordinates.plus(200, 200);

entityContainerDragAndDrop.createEntity([
    contPosition,
    rectPath,
    dropContainer
])

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function addCircles(entityContainer: EntityContainer) {

    for (let i = 0; i < 10; i++) {
        // await sleep(2);
        let position = new Position()
        position.x = Math.random() * 500
        position.y = Math.random() * 500

        let color = new Color()
        color.fill = Math.random() > 0.5 ? 'green' : 'red'

        let radius = new Radius()
        radius.radius = 10

        let entity = entityContainer.createEntity([
            position,
            color,
            radius,
            new DrawCircle(),
        ])

        let path = new SvgPathComponent();
        path.path = ' m -' + radius.radius + ', 0\n' +
            'a ' + radius.radius + ',' + radius.radius + ' 0 1,0 ' + (radius.radius * 2) + ',0\n' +
            'a ' + radius.radius + ',' + radius.radius + ' 0 1,0 -' + (radius.radius * 2) + ',0';
        path.fillStyle = color.fill
        path.strokeStyle = "black"

        let coords = new PositionComponent();
        coords.coordinates = new Vector(position.x, position.y);
        let draggable = new DraggableComponent();
        if (color.fill === 'green') {
            draggable.tags.push("dropGreenCircle");
        } else {
            draggable.tags.push("dropRedCircle");
        }
        let svgEntity = entityContainer.createEntity([
            path,
            coords,
            draggable
        ]);
    }
    let position = new Position()
    position.x = 0
    position.y = 0
    let color = new Color()
    color.fill = "blue"
    let radius = new Radius()
    radius.radius = 20

    let entity = entityContainer.createEntity([
        position,
        color,
        radius,
        new DrawCircle(),
    ])
    setTimeout(() => entityContainer.getEventManager().dispatch(new RerenderEvent()), 100)
}

// async function updateLoop() {
//   while (1) {
//     await sleep(1000)
//     entityContainer.getEventManager().dispatch(new FullRerenderEvent())
//   }
// }


