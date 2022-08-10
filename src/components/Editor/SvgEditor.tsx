import React, { Fragment } from 'react'
import { ComponentSystem, EntityContainer, RerenderEvent } from '../../lib'

type Props = {
  entityContainer: EntityContainer,
  systems: ComponentSystem[]
}

type State = {
}


export default class SvgEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
  }

  componentDidMount(){
    this.props.systems.map((system) => {
      system.onMount();
    })

    this.props.entityContainer.getEventManager().subscribe(RerenderEvent, this.rerender);
  }

  rerender = (event?: RerenderEvent) => {
    this.forceUpdate();
  }

  componentWillUnmount() {
    this.props.systems.map((system) => {
      system.onUnMount();
    })
    this.props.entityContainer.getEventManager().unsubscribe(RerenderEvent, this.rerender);
  }

  render(): React.ReactNode {
    
    return (
      <svg width={500} height={500}>
        {this.props.systems.map((system) => system.render())}
      </svg>
    )
  }
}
