import React from 'react'

type Props = {}

type State = {}

export default class SvgEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
  }

  render(): React.ReactNode {
    return (
      <svg width={500} height={500}>
        <circle cx={100} cy={100} r={10} fill={'red'} />
      </svg>
    )
  }
}
