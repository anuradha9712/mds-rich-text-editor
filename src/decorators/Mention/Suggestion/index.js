import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import addMention from '../addMention';
import KeyDownHandler from '../../../event-handler/keyDown';
import SuggestionHandler from '../../../event-handler/suggestions';
import { Icon, Text, Popover, Placeholder, PlaceholderParagraph, Dropdown, Input } from '@innovaccer/design-system'
import { searchElement } from '../../../utils/common';
import {
  EditorState,
  Modifier,
} from 'draft-js';
class Suggestion {
  constructor(config) {
    const {
      separator = ' ',
      trigger = '@',
      getSuggestions,
      onChange,
      getEditorState,
      getWrapperRef,
      caseSensitive,
      optionClassName,
      modalHandler,
      dropdownOptions,
      fetchSuggestions,
      parentRef
    } = config;
    this.config = {
      separator,
      trigger,
      getSuggestions,
      onChange,
      getEditorState,
      getWrapperRef,
      caseSensitive,
      dropdownOptions,
      optionClassName,
      modalHandler,
      fetchSuggestions,
      parentRef
    };
  }

  findSuggestionEntities = (contentBlock, callback) => {
    if (this.config.getEditorState()) {
      const {
        separator,
        trigger,
        getSuggestions,
        getEditorState,
        fetchSuggestions
      } = this.config;
      const selection = getEditorState().getSelection();
      console.log("aaselection-> ", selection);
      if (
        selection.get('anchorKey') === contentBlock.get('key') &&
        selection.get('anchorKey') === selection.get('focusKey')
      ) {
        let text = contentBlock.getText();
        console.log("aaoriginal text-> ", text)

        text = text.substr(
          0,
          selection.get('focusOffset') === text.length - 1
            ? text.length
            : selection.get('focusOffset') + 1
        );
        console.log("aatext after modification-> ", text);
        let index = text.lastIndexOf(separator + trigger);
        console.log("aatrigger-> ", trigger);
        console.log("aaseparator-> ", separator);
        console.log("aaindex-> ", index);
        let preText = separator + trigger;
        console.log("aapretexttt-> ", preText);

        if ((index === undefined || index < 0) && text[0] === trigger) {
          index = 0;
          preText = trigger;
        }

        if (index >= 0) {
          if (fetchSuggestions) {
            console.log("aainside if condition-> ", index, text);
            callback(index === 0 ? 0 : index + 1, text.length);
          }
          else {
            console.log("aainside else condition-> ", index, text);
            const staticSuggestionList = getSuggestions();
            const mentionText = text.substr(index + preText.length, text.length);
            const suggestionPresent = searchElement(staticSuggestionList, mentionText, this.config.caseSensitive);

            console.log("aamentionText-> ", mentionText);
            console.log("aacallback-> ", callback);
            if (suggestionPresent.length > 0) {
              callback(index === 0 ? 0 : index + 1, text.length);
            }
          }
        }
        console.log("aa==========================================================================")
      }
    }
  };

  // findSuggestionEntities = (contentBlock, callback) => {
  //   if (this.config.getEditorState()) {
  //     const {
  //       separator,
  //       trigger,
  //       getSuggestions,
  //       getEditorState,
  //       fetchSuggestions
  //     } = this.config;
  //     const selection = getEditorState().getSelection();
  //     if (
  //       selection.get('anchorKey') === contentBlock.get('key') &&
  //       selection.get('anchorKey') === selection.get('focusKey')
  //     ) {
  //       let text = contentBlock.getText();
  //       console.log("original text--> ", text);

  //       text = text.substr(
  //         0,
  //         selection.get('focusOffset') === text.length - 1
  //           ? text.length
  //           : selection.get('focusOffset') + 1
  //       );
  //       let index = text.lastIndexOf(separator + trigger);
  //       let preText = separator + trigger;
  //       if ((index === undefined || index < 0) && text[0] === trigger) {
  //         index = 0;
  //         preText = trigger;
  //       }
  //       console.log("aaainside fetchSuggestions--> ", index)

  //       // index = 4;

  //       // if (index >= 0) {
  //       //   if (fetchSuggestions) {
  //       //     console.log("inside iff fetchSuggestions--> ", index)
  //       //     callback(index === 0 ? 0 : index + 1, text.length);
  //       //   }
  //       //   else {
  //       //     console.log("inside else fetchSuggestions--> ", index)

  //       //     const staticSuggestionList = getSuggestions();
  //       //     const mentionText = text.substr(index + preText.length, text.length);
  //       //     const suggestionPresent = searchElement(staticSuggestionList, mentionText, this.config.caseSensitive);

  //       //     if (suggestionPresent.length > 0) {
  //       //       callback(index === 0 ? 0 : index + 1, text.length);
  //       //     }
  //       //   }
  //       // }
  //       if (index >= 0) {
  //         if (fetchSuggestions) {
  //           console.log("inside iff fetchSuggestions--> ", index,text)
  //           callback(index === 0 ? 0 : index + 1, text.length);

  //         }
  //         else {
  //           console.log("inside else fetchSuggestions--> ", index)

  //           const staticSuggestionList = getSuggestions();
  //           const mentionText = text.substr(index + preText.length, text.length);
  //           const suggestionPresent = searchElement(staticSuggestionList, mentionText, this.config.caseSensitive);

  //           if (suggestionPresent.length > 0) {
  //             callback(index === 0 ? 0 : index + 1, text.length);
  //           }
  //         }
  //       }
  //     }
  //   }
  // };

  getSuggestionComponent = getSuggestionComponent.bind(this);

  getSuggestionDecorator = () => ({
    strategy: this.findSuggestionEntities,
    component: this.getSuggestionComponent(),
  });
}

function getSuggestionComponent() {
  const { config } = this;
  return class SuggestionComponent extends Component {
    static propTypes = {
      children: PropTypes.array,
    };

    state = {
      style: { left: 15 },
      activeOption: -1,
      showSuggestions: true,
      showLoader: false
    };

    componentDidMount() {
      KeyDownHandler.registerCallBack(this.onEditorKeyDown);
      SuggestionHandler.open();
      config.modalHandler.setSuggestionCallback(this.closeSuggestionDropdown);
      this.updateSuggestions(this.props);
      this.setState({
        showSuggestions: true
      });
    }

    componentDidUpdate(props) {
      const { children } = this.props;
      if (children !== props.children) {
        this.updateSuggestions(this.props);
        this.setState({
          showSuggestions: true,
        });
      }
    }

    componentWillUnmount() {
      KeyDownHandler.deregisterCallBack(this.onEditorKeyDown);
      SuggestionHandler.close();
      config.modalHandler.removeSuggestionCallback();
    }

    onEditorKeyDown = event => {
      const { activeOption } = this.state;
      const newState = {};

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (activeOption === this.filteredSuggestions.length - 1) {
          newState.activeOption = 0;
        } else {
          newState.activeOption = Number(activeOption) + 1;
        }
      } else if (event.key === 'ArrowUp') {
        if (activeOption <= 0) {
          newState.activeOption = this.filteredSuggestions.length - 1;
        } else {
          newState.activeOption = Number(activeOption) - 1;
        }
      } else if (event.key === 'Escape') {
        newState.showSuggestions = false;
        SuggestionHandler.close();
      } else if (event.key === 'Enter') {
        this.addMention();
      }
      this.setState(newState);
    };

    onOptionMouseEnter = event => {
      const index = event.target.getAttribute('data-index');
      this.setState({
        activeOption: index,
      });
    };

    onOptionMouseLeave = () => {
      this.setState({
        activeOption: -1,
      });
    };

    setSuggestionReference = ref => {
      this.suggestion = ref;
    };

    setDropdownReference = ref => {
      this.dropdown = ref;
    };

    // closeSuggestionDropdown = () => {
    //   console.log("inside closeSuggestionss")
    //   this.setState({
    //     showSuggestions: false,
    //   });
    // };

    filteredSuggestions = [];

    filterSuggestions = mentionText => {
      const suggestions = config.getSuggestions ? config.getSuggestions() : [];
      this.filteredSuggestions = searchElement(suggestions, mentionText, config.caseSensitive);
      // this.filteredSuggestions = this.filteredSuggestions.map((suggestion, index) => this.renderOption(suggestion, index))
      console.log("this.filteredSuggestions-->c", this.filteredSuggestions);

    };

    updateSuggestions = props => {
      const mentionText = props.children[0].props.text.substr(1);

      if (config.fetchSuggestions) {
        this.setState({
          showLoader: true
        })
        config.fetchSuggestions(mentionText)
          .then(result => {
            console.log("result--> ", result);
            this.filteredSuggestions = result;
            this.setState({
              showSuggestions: result.options.length > 0,
              // showSuggestions: false,
              showLoader: false
            });
          });
      } else {
        this.filterSuggestions(mentionText);
      }
    }

    addMention = (e) => {
      console.log("inside addMention--> ", e);
      const { activeOption } = this.state;
      const editorState = config.getEditorState();
      const { onChange, separator, trigger } = config;
      const selectedMention = this.filteredSuggestions[activeOption];
      // const selectedMention = {
      //   label: e,
      //   value: e
      // }

      console.log("activeOption-> ", activeOption);
      console.log("onChange-> ", onChange);
      console.log("separator-> ", separator);
      console.log("trigger-> ", trigger);
      console.log("selectedMention-> ", selectedMention);
      console.log("editorState-> ", editorState);


      if (selectedMention) {
        console.log("inside if condition addMention--> ", e);
        this.setState({
          showSuggestions: false,
        });
        addMention(editorState, onChange, separator, trigger, selectedMention);
      }

    };

    getInsertRange = (editorState) => {
      const selection = editorState.getSelection()
      const content = editorState.getCurrentContent()
      const anchorKey = selection.getAnchorKey()
      const end = selection.getAnchorOffset()
      const block = content.getBlockForKey(anchorKey)
      const text = block.getText()
      const start = text.substring(0, end).lastIndexOf('@')
      console.log("start--> ", start, "-->", end)
      return {
        start,
        end,
      }
    }

    addSuggestion = (content) => {
      const editorState = config.getEditorState();
      const { start, end } = this.getInsertRange(editorState)
      const contentState = editorState.getCurrentContent()
      console.log("contentState-> ", contentState);
      const currentSelection = editorState.getSelection()
      const selection = currentSelection.merge({
        anchorOffset: start,
        focusOffset: end,
      })

      console.log("content in addSggestion--> ", content)

      // this.setState({
      //   showSuggestions: false,
      // });

      const contentStateWithEntity = 
      // contentState.createEntity(
      //   'MENTION', 'IMMUTABLE', { content })
        contentState.createEntity('MENTION', 'IMMUTABLE', { text: `@${content}`, content })

      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const newContentState = Modifier.replaceText(
        contentStateWithEntity,
        selection,
        // `${PREFIX}${content}`,
        `@${content}`,
        null,
        entityKey)

      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        'insert-characters')

      config.onChange(EditorState.forceSelection(
        newEditorState,
        newContentState.getSelectionAfter()))

      // onChange(EditorState.push(newEditorState, contentState, 'insert-characters'));

    }

    getOptionClass = (index) => {
      const { activeOption } = this.state;

      const OptionClass = classNames({
        ['Editor-dropdown-option']: true,
        ['Editor-dropdown-option--highlight']: index === activeOption
      });

      return OptionClass;
    };

    renderOption = (suggestion, index) => {
      const { dropdownOptions = {} } = config;
      const { customOptionRenderer } = dropdownOptions;
      const { icon, label } = suggestion;

      if (customOptionRenderer) {
        const optionRenderer = customOptionRenderer(suggestion, this.state.activeOption, index);
        const CustomOption = React.cloneElement(optionRenderer, {
          key: index,
          spellCheck: false,
          onClick: this.addMention,
          'data-index': index,
          onMouseEnter: this.onOptionMouseEnter,
          onMouseLeave: this.onOptionMouseLeave,
        });
        return CustomOption;
      }

      return (
        <span
          key={index}
          spellCheck={false}
          onClick={this.addMention}
          // onClick={this.addSuggestion(label)}
          data-index={index}
          onMouseEnter={this.onOptionMouseEnter}
          onMouseLeave={this.onOptionMouseLeave}
          className={this.getOptionClass(index)}
        >
          {icon && <Icon name={icon} className="mr-4" />}
          <Text>{label}</Text>
        </span>
      );
    };

    render() {
      const { children } = this.props;
      const { showSuggestions } = this.state;
      const { dropdownOptions = {} } = config;
      const { dropdownClassName } = dropdownOptions;

      const DropdownClass = classNames({
        ['Popover']: true,
        [`${dropdownClassName}`]: dropdownClassName !== undefined,
        ['Editor-mention-dropdown']: true,
      });

      const customTriggerFunc = (label) => {
        return (
          <div style={{ width: '100%' }}>
            <Input
              type="text"
              name="input"
              value={label}
              onChange={(label) => this.addSuggestion(label)}
            />
          </div>
        );
      };
    
      // return (
      //   <span
      //     className="Editor-mention-suggestion"
      //     ref={this.setSuggestionReference}
      //     onClick={config.modalHandler.onSuggestionClick}
      //     aria-haspopup="true"
      //   >
      //     <span>{children}</span>
      //     {showSuggestions && (
      //       <Popover
      //         position="bottom-start"
      //         open={true}
      //         appendToBody={true}
      //         className={DropdownClass}
      //         contentEditable="false"
      //         suppressContentEditableWarning
      //         ref={this.setDropdownReference}
      //       >
      //         {this.state.showLoader ?
      //           <span className="Editor-dropdown-option" >
      //             <Placeholder withImage={false}>
      //               <PlaceholderParagraph length="large" />
      //               <PlaceholderParagraph length="large" />
      //               <PlaceholderParagraph length="large" />
      //             </Placeholder>
      //           </span>
      //           :
      //           this.filteredSuggestions.map((suggestion, index) =>
      //             this.renderOption(suggestion, index)
      //           )
      //         }
      //       </Popover>
      //     )}
      //   </span>
      // );

      console.log("parentRef---> ", config.parentRef);
      return (
        <span
          className="Editor-mention-suggestion"
          ref={this.setSuggestionReference}
          onClick={config.modalHandler.onSuggestionClick}
          aria-haspopup="true"
        >
          <span>{children}</span>
          {showSuggestions && (

            <Dropdown
              open={true}
              // customTrigger={customTriggerFunc}
              customTrigger={this.getSuggestionComponent}
              fetchOptions={config.fetchSuggestions}
              // options={this.filteredSuggestions}
              //options={[ { label: 'Edit' , value: 'edit' }, { label: 'Export' , value: 'export' }, { label: 'Delete' , value: 'delete' } ]}
              onChange={(e) => this.addSuggestion(e)}
              onUpdate={(e) => this.addSuggestion(e)}
              //onClose={this.addMention}
              className={DropdownClass}
              align='right'
              menu={true}
              ref={this.setDropdownReference}
              appendToBody={true}
              contentEditable="false"
              suppressContentEditableWarning
            />
          )}
        </span>
      );

      // return (
      //   <span
      //     className="Editor-mention-suggestion"
      //     ref={this.setSuggestionReference}
      //     onClick={config.modalHandler.onSuggestionClick}
      //     aria-haspopup="true"
      //   >
      //     <span>{children}</span>
      //     {showSuggestions &&
      //       <Dropdown
      //         open={true}
      //         customTrigger=""
      //         // fetchOptions={config.fetchSuggestions}
      //         // options={this.filteredSuggestions}
      //         options={[{ label: 'ID', value: 'ID' }, { label: 'Export', value: 'export' }, { label: 'Delete', value: 'delete' }]}
      //         onChange={(e) => this.addSuggestion(e)}
      //         onUpdate={(e) => this.addSuggestion(e)}
      //         //onClose={this.addMention}
      //         className={DropdownClass}
      //         align='bottom'
      //         menu={true}
      //         ref={this.setDropdownReference}
      //         appendToBody={true}
      //         contentEditable="false"
      //         suppressContentEditableWarning
      //         withSearch={false}
      //       />
      //     }
      //   </span>
      // )
    }
  };
}

export default Suggestion;
