import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { SvgEditor } from '../components';
import { AddComponentEvent, Component, ComponentSystem, EntityContainer, RerenderEvent } from '../lib';
import { FixCameraOnWindowResize, MousePositionCapture } from '../systems';
import ZoomOnWheel from '../systems/Editor/ZoomOnWheel';

export default {
  title: 'Editor/SvgEditor',
  component: SvgEditor,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} as ComponentMeta<typeof SvgEditor>;



const Template: ComponentStory<typeof SvgEditor> = (args) => <SvgEditor {...args} />;



export const OnlySimpleRender = Template.bind({});

export const RenderAndWindowResize = Template.bind({});
export const RenderAndWindowResizeAndZoom = Template.bind({});

let entityContainer = new EntityContainer();

// Component Classes
class Position extends Component{
  public x: number = 0;
  public y: number = 0;
}

class Color extends Component {
  public fill: string = 'red';
} 

class Radius extends Component {
  public radius: number = 10;
}

class DrawCircle extends Component{}

class DomNode extends Component{
  public node: any;
}


// System Classes

class RenderCircle extends ComponentSystem{
  
  public onMount(): void {
    this.entityContainer.getEventManager().subscribe(AddComponentEvent, this.onAddComponent);
  }

  public onUnMount(): void {
    this.entityContainer.getEventManager().unsubscribe(AddComponentEvent, this.onAddComponent);
  }

  onAddComponent = (event: AddComponentEvent) => {
    if(event.getComponent() instanceof DrawCircle){
      this.entityContainer.getEventManager().dispatch(new RerenderEvent); 
    }
  }

  render = (): React.ReactNode => {
    
    let drawFlags = this.entityContainer.getComponents<DrawCircle>(DrawCircle);
    return  drawFlags.map(this.drawCircle);
  };

  drawCircle = (flag: DrawCircle, key: number): React.ReactNode => {
    let position = this.entityContainer.getComponentsByEntityId<Position>(flag.getEntityId(), Position)[0];
    let radius  = this.entityContainer.getComponentsByEntityId<Radius>(flag.getEntityId(), Radius)[0];
    let color    = this.entityContainer.getComponentsByEntityId<Color>(flag.getEntityId(), Color)[0];
    return <circle cx={position.x} cy={position.y} r={radius.radius}  fill={color.fill} key={key} />
  }
}




function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

 async function addCircles(){
  await sleep(1000);

  for(let i = 0; i< 1000; i++){
    // await sleep(200);
    let position = new Position;
    position.x = Math.random()*500;
    position.y = Math.random()*500;

    let color = new Color;
    color.fill = Math.random() > 0.5 ? "green": "red";

    let radius = new Radius;
    radius.radius = 10;



    let entity = entityContainer.createEntity([
      position,
      color,
      radius,
      new DrawCircle
    ]);
  }
}


async function updateLoop() {

    while(1){
    await sleep(1000);
      entityContainer.getEventManager().dispatch(new RerenderEvent);
    }
}

OnlySimpleRender.args = {
  entityContainer: entityContainer,
  systems: [
    new RenderCircle(entityContainer),
  ]
}

RenderAndWindowResize.args = {
  entityContainer: entityContainer,
  systems: [
    new FixCameraOnWindowResize(entityContainer),
    new RenderCircle(entityContainer),
  ]
}

RenderAndWindowResizeAndZoom.args = {
  entityContainer: entityContainer,
  systems: [
    new FixCameraOnWindowResize(entityContainer),
    new RenderCircle(entityContainer),
    new ZoomOnWheel(entityContainer),
    new MousePositionCapture(entityContainer),
  ]
}

addCircles();