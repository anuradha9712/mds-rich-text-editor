import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getSelectedBlocksType } from 'draftjs-utils';
import { RichUtils } from 'draft-js';

import LayoutComponent from './Component';
import { Icon, Dropdown } from '@innovaccer/design-system';


class Heading extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    editorState: PropTypes.object,
    modalHandler: PropTypes.object,
    config: PropTypes.object,
    className: PropTypes.string
  };

  constructor(props) {
    super(props);
    const { editorState, modalHandler } = props;
    this.state = {
      expanded: false,
      currentBlockType: editorState
        ? getSelectedBlocksType(editorState)
        : 'unstyled',
    };
    modalHandler.registerCallBack(this.expandCollapse);
  }

  componentDidUpdate(prevProps) {
    const { editorState } = this.props;
    if (editorState && editorState !== prevProps.editorState) {
      this.setState({
        currentBlockType: getSelectedBlocksType(editorState),
      });
    }
  }

  componentWillUnmount() {
    const { modalHandler } = this.props;
    modalHandler.deregisterCallBack(this.expandCollapse);
  }

  onExpandEvent = () => {
    this.signalExpanded = !this.state.expanded;
  };

  expandCollapse = () => {
    this.setState({
      expanded: this.signalExpanded,
    });
    this.signalExpanded = false;
  };

  blocksTypes = [
    //{ label: 'Normal', style: 'unstyled' },
    { label: 'H1', style: 'header-one', value: 'H1' },
    { label: 'H2', style: 'header-two', value: 'H2' },
    { label: 'H3', style: 'header-three', value: 'H3' },
    { label: 'H4', style: 'header-four', value: 'H4' },
  ];

  doExpand = () => {
    this.setState({
      expanded: true,
    });
  };

  doCollapse = () => {
    this.setState({
      expanded: false,
    });
  };

  toggleBlockType = blockType => {
    const blockTypeValue = this.blocksTypes.find(bt => bt.label === blockType)
      .style;
    const { editorState, onChange } = this.props;
    const newState = RichUtils.toggleBlockType(editorState, blockTypeValue);
    if (newState) {
      onChange(newState);
    }
  };

  render() {
    const { config, className } = this.props;
    const { expanded, currentBlockType } = this.state;
    const blockType = this.blocksTypes.find(
      bt => bt.style === currentBlockType
    );

    return (
      // <LayoutComponent
      //   config={config}
      //   currentState={{ blockType: blockType && blockType.label }}
      //   onChange={this.toggleBlockType}
      //   expanded={expanded}
      //   onExpandEvent={this.onExpandEvent}
      //   doExpand={this.doExpand}
      //   doCollapse={this.doCollapse}
      //   className={className}
      // />

      <Dropdown align="right" icon={config.icon} placeholder="  " className={className} onChange={this.toggleBlockType} options={this.blocksTypes} />

    );
  }
}

export default Heading;
