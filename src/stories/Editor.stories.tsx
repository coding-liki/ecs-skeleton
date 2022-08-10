import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { SvgEditor } from '../components';
import { AddComponentEvent, Component, ComponentSystem, EntityContainer, RerenderEvent } from '../lib';

export default {
  title: 'Editor/SvgEditor',
  component: SvgEditor,
} as ComponentMeta<typeof SvgEditor>;



const Template: ComponentStory<typeof SvgEditor> = (args) => <SvgEditor {...args} />;



export const NoThings = Template.bind({});

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

  drawCircle = (flag: DrawCircle): React.ReactNode => {
    let position = this.entityContainer.getEntityComponents<Position>(flag.getEntityId(), Position)[0];
    let radius  = this.entityContainer.getEntityComponents<Radius>(flag.getEntityId(), Radius)[0];
    let color    = this.entityContainer.getEntityComponents<Color>(flag.getEntityId(), Color)[0];
    return <circle cx={position.x} cy={position.y} r={radius.radius}  fill={color.fill}/>
  }
}




function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

 function addCircles(){
  for(let i = 0; i< 100; i++){
    //await sleep(200);
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

NoThings.args = {
  entityContainer: entityContainer,
  systems: [
    new RenderCircle(entityContainer)
  ]
}

addCircles();

updateLoop();
