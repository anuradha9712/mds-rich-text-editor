import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { stopPropagation } from '../../../utils/common';
import Option from '../../../components/Option';
import { Button, Icon, Popover } from '@innovaccer/design-system';
import './styles.css';
import classNames from 'classnames';


class LayoutComponent extends Component {
  static propTypes = {
    expanded: PropTypes.bool,
    onExpandEvent: PropTypes.func,
    onChange: PropTypes.func,
    config: PropTypes.object,
    currentState: PropTypes.object,
    className: PropTypes.className,
    // onToggle: PropTypes.func,
  };

  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     currentStyle: 'color',
  //   };
  //   this.ref = React.createRef();
  // }

  state = {
    currentStyle: 'color',
  };

  componentDidUpdate(prevProps) {
    const { expanded } = this.props;
    if (expanded && !prevProps.expanded) {
      // if (this.ref.current) {
      //   // Todo
      //   // this.ref.current.focus();
      // }
      this.setState({
        currentStyle: 'color',
      });
    }
  }

  onChange = color => {
    const { onChange } = this.props;
    const { currentStyle } = this.state;
    onChange(currentStyle, color);
  };

  // onChange = (color) => {
  //   const { onChange, expanded } = this.props;
  //   if (!expanded) return;
  //   const { currentStyle } = this.state;
  //   onChange(currentStyle, color);
  // };

  // handleClick = (event) => {
  //   const color = event.target.getAttribute('data-color');
  //   if (!color) {
  //     return;
  //   }
  //   event.preventDefault();
  //   event.stopPropagation();
  //   this.onChange(color);
  // };

  // handleKeyDown = (event) => {
  //   const color = event.target.getAttribute('data-color');
  //   if (!color) {
  //     return;
  //   }
  //   if (event.key === 'Enter') {
  //     event.preventDefault();
  //     event.stopPropagation();
  //     this.onChange(color);
  //   }
  // };

  setCurrentStyleColor = () => {
    this.setState({
      currentStyle: 'color',
    });
  };

  setCurrentStyleBgcolor = () => {
    this.setState({
      currentStyle: 'bgcolor',
    });
  };

  renderModal = () => {
    const {
      config: { popupClassName, colors },
      currentState: { color, bgColor },
      translations,
    } = this.props;
    const { currentStyle } = this.state;
    const currentSelectedColor = currentStyle === 'color' ? color : bgColor;
    return (
      <div
        // className='rdw-colorpicker-modal'
        // onClick={this.onChange}
        // className={classNames('rdw-colorpicker-modal', popupClassName)}
        // onClick={stopPropagation}
      >
        {/* <span className="rdw-colorpicker-modal-header">
          <span
            className={classNames('rdw-colorpicker-modal-style-label', {
              'rdw-colorpicker-modal-style-label-active':
                currentStyle === 'color',
            })}
            onClick={this.setCurrentStyleColor}
          >
          </span>
          <span
            className={classNames('rdw-colorpicker-modal-style-label', {
              'rdw-colorpicker-modal-style-label-active':
                currentStyle === 'bgcolor',
            })}
            onClick={this.setCurrentStyleBgcolor}
          >
          </span>
        </span> */}
        <span className="rdw-colorpicker-modal-options">
          {colors.map((c, index) => (
            <Option
              value={c}
              key={index}
              className="rdw-colorpicker-option"
              activeClassName="rdw-colorpicker-option-active"
              active={currentSelectedColor === c}
              onClick={this.onChange}
            >
              <span
                style={{ backgroundColor: c }}
                className="rdw-colorpicker-cube"
              />
            </Option>
          ))}
        </span>
      </div>
    );
  };

  // renderModal = () => {
  //   const {
  //     config: { colors },
  //     currentState: { color, bgColor },
  //   } = this.props;

  //   const { currentStyle } = this.state;
  //   const currentSelectedColor = currentStyle === 'color' ? color : bgColor;

  //   return (
  //     // <div className={'Editor-colorPicker'} onClick={this.onChange} onKeyDown={this.handleKeyDown}>
  //     //   {colors.map((c, index) => (
  //     //     <div className="Editor-colorPicker-circleWrapper">
  //     //       <div
  //     //         ref={index === 0 ? this.ref : null}
  //     //         data-color={c}
  //     //         tabIndex={0}
  //     //         key={index}
  //     //         style={{ backgroundColor: c }}
  //     //         className="Editor-colorPicker-circle"
  //     //         aria-selected={currentSelectedColor === c}
  //     //       />
  //     //       {currentSelectedColor === c && (
  //     //         <Icon name="check" appearance="white" className={'Editor-colorPicker-selectedCircle'} />
  //     //       )}
  //     //     </div>
  //     //   ))}
  //     // </div>

  //     <div className={'Editor-colorPicker'} onClick={this.onChange} onKeyDown={this.handleKeyDown}>
  //       {colors.map((c, index) => (
  //         <div className="Editor-colorPicker-circleWrapper">
  //           <div
  //             ref={index === 0 ? this.ref : null}
  //             data-color={c}
  //             tabIndex={0}
  //             key={index}
  //             style={{ backgroundColor: c }}
  //             className="Editor-colorPicker-circle"
  //             aria-selected={currentSelectedColor === c}
  //           >
  //           {currentSelectedColor === c && (
  //             <Icon name="check" appearance="white" className={'Editor-colorPicker-selectedCircle'} />
  //           )}
  //           </div>
  //         </div>
  //       ))}
  //     </div>

  //   //         <div className={'Editor-colorPicker'} 
  //   //         // onClick={this.handleClick} 
  //   //         onClick={stopPropagation}
  //   //         onKeyDown={this.handleKeyDown}>

  //   //   <span 
  //   //   className="rdw-colorpicker-modal-options"
  //   //   >
  //   //     {colors.map((c, index) => (
  //   //       <Option
  //   //         value={c}
  //   //         key={index}
  //   //         className="rdw-colorpicker-option"
  //   //         activeClassName="rdw-colorpicker-option-active"
  //   //         active={currentSelectedColor === c}
  //   //         onClick={this.onChange}
  //   //       >
  //   //         <span
  //   //           style={{ backgroundColor: c }}
  //   //           className="Editor-colorPicker-circle"
  //   //         >
  //   //         {currentSelectedColor === c && (
  //   //           <Icon name="check" appearance="white" className={'Editor-colorPicker-selectedCircle bg-primary'} />
  //   //         )}
  //   //         </span>
  //   //       </Option>
  //   //     ))}
  //   //   </span>
  //   // </div>
  //   );
  // };




  // renderModal = () => {
  //   const {
  //     config: { colors },
  //     currentState: { color, bgColor },
  //   } = this.props;

  //   const { currentStyle } = this.state;
  //   const currentSelectedColor = currentStyle === 'color' ? color : bgColor;

  //   return (
  //     <div className={'Editor-colorPicker'} onClick={this.handleClick} onKeyDown={this.handleKeyDown}>
  //       {colors.map((c, index) => (
  //         <div className="Editor-colorPicker-circleWrapper">
  //           <div
  //             ref={index === 0 ? this.ref : null}
  //             data-color={c}
  //             tabIndex={0}
  //             key={index}
  //             style={{ backgroundColor: c }}
  //             className="Editor-colorPicker-circle"
  //             aria-selected={currentSelectedColor === c}
  //           />
  //           {currentSelectedColor === c && (
  //             <Icon name="check" appearance="white" className={'Editor-colorPicker-selectedCircle'} />
  //           )}
  //         </div>
  //       ))}
  //     </div>
  //   );
  // };

  render() {
    const { expanded, onExpandEvent, onToggle, className } = this.props;

    const trigger = (
      <Option tabIndex={0} aria-label="Font colors" onClick={onExpandEvent} active={expanded} activeClassName="bg-secondary">
        <Icon name="text_format" size={20} />
      </Option>
    );

    return (
      <div className={className} aria-haspopup="true" aria-expanded={expanded}>
        <Popover trigger={trigger} position="bottom-start" open={expanded}>
          {this.renderModal()}
        </Popover>
      </div>
    );
  }
}

export default LayoutComponent;
