import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { EditorState, Modifier } from 'draft-js';
import KeyDownHandler from '../../../event-handler/keyDown';
import SuggestionHandler from '../../../event-handler/suggestions';
import { Icon, Text, Popover, Placeholder, PlaceholderParagraph } from '@innovaccer/design-system';
import { searchElement, debounce } from '../../../utils/common';
import {
  createSelection,
  findBlockKey,
  getMentionIndex,
  createMentionEntity,
  ensureSpaceAfterMention,
} from './helpers';

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
      getLastKeyPressed,
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
      getLastKeyPressed,
    };
  }

  findSuggestionEntities = (contentBlock, callback) => {
    if (this.config.getEditorState()) {
      const { separator, trigger, getSuggestions, getEditorState, fetchSuggestions, getLastKeyPressed } = this.config;
      const selection = getEditorState().getSelection();

      if (
        selection.get('anchorKey') === contentBlock.get('key') &&
        selection.get('anchorKey') === selection.get('focusKey')
      ) {
        const blockText = contentBlock.getText();
        const focusOffset = selection.getFocusOffset();

        const textUntilCursor = blockText.substr(
          0,
          getLastKeyPressed() === 'Backspace' ? focusOffset - 1 : focusOffset + 1
        );

        const separatorList = [separator, '\n'];
        let separatorIndex = -1;
        let separatorWithTrigger = '';

        separatorList.forEach((sep) => {
          const sepIndex = textUntilCursor.lastIndexOf(sep + trigger);
          if (sepIndex > separatorIndex) {
            separatorIndex = sepIndex;
            separatorWithTrigger = sep + trigger;
          }
        });

        if ((separatorIndex === undefined || separatorIndex < 0) && textUntilCursor[0] === trigger) {
          separatorIndex = 0;
          separatorWithTrigger = trigger;
        }

        if (separatorIndex >= 0) {
          const mentionText = textUntilCursor.substr(
            separatorIndex + separatorWithTrigger.length,
            textUntilCursor.length
          );
          if (fetchSuggestions) {
            // Call the callback function only if the mention text contains fewer than 3 words
            if (mentionText.trim().split(/\s+/).length < 3) {
              callback(
                separatorIndex === 0 && textUntilCursor[0] === trigger ? 0 : separatorIndex + 1,
                textUntilCursor.length
              );
            }
          } else {
            const staticSuggestionList = getSuggestions();
            const suggestionPresent = searchElement(staticSuggestionList, mentionText, this.config.caseSensitive);

            if (suggestionPresent.length > 0) {
              callback(
                separatorIndex === 0 && textUntilCursor[0] === trigger ? 0 : separatorIndex + 1,
                textUntilCursor.length
              );
            }
          }
        }
      }
    }
  };

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
      showLoader: false,
      keyDown: true,
      lastFetchedMentionText: '',
    };

    openSuggestionDropdown = () => {
      SuggestionHandler.open();
      this.setState({ showSuggestions: true });
    };

    closeSuggestionDropdown = () => {
      SuggestionHandler.close();
      this.setState({ showSuggestions: false });
    };

    componentDidMount() {
      const suggestionRect = this.suggestion.getBoundingClientRect();
      let left = suggestionRect.left;
      let top = suggestionRect.top + 25;
      this.setState({
        // eslint-disable-line react/no-did-mount-set-state
        style: { left, top },
      });
      KeyDownHandler.registerCallBack(this.onEditorKeyDown);
      this.updateSuggestions();
    }

    componentDidUpdate(props) {
      const { children } = this.props;
      if (children !== props.children) {
        this.updateSuggestions();
      }
    }

    componentWillUnmount() {
      KeyDownHandler.deregisterCallBack(this.onEditorKeyDown);
      this.closeSuggestionDropdown();
      config.modalHandler.removeSuggestionCallback();
    }

    focusOption = (direction, classes, index, customOptionClass) => {
      let elements = document.querySelectorAll(classes);

      if (elements.length === 0) {
        elements = document.querySelectorAll(`.${customOptionClass}`);
      }
      if (typeof index == 'string') {
        index = parseInt(index);
      }
      const updatedCursor = direction === 'down' ? index + 1 : index - 1;
      let startIndex = updatedCursor;
      const endIndex = direction === 'down' ? elements.length : -1;
      if (startIndex === endIndex) {
        startIndex = 0;
      }
      if (updatedCursor === -1 && endIndex === -1) {
        startIndex = elements.length - 1;
      }
      const element = elements[startIndex];
      if (element) {
        element.scrollIntoView({ block: 'end' });
      }
    };

    onEditorKeyDown = (event) => {
      const { showSuggestions, activeOption } = this.state;
      if (!showSuggestions) {
        return;
      }
      const newState = {};
      const customOptionClass = config?.dropdownOptions?.dropdownOptionClassName;
      const optionClass = '.Editor-dropdown-option' || `.${customOptionClass}`;

      this.disableMouseEvents();
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.focusOption('down', optionClass, activeOption, customOptionClass);
        if (activeOption === this.filteredSuggestions.length - 1) {
          newState.activeOption = 0;
        } else {
          newState.activeOption = Number(activeOption) + 1;
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.focusOption('up', optionClass, activeOption, customOptionClass);
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

    onOptionMouseOver = (event) => {
      this.enableMouseEvents();
      const index = parseInt(event.target.getAttribute('data-index'));
      if (index >= 0 && index < this.filteredSuggestions.length) {
        this.setState({
          activeOption: index,
        });
      }
    };

    disableMouseEvents = () => {
      this.setState({
        keyDown: true,
      });
    };

    enableMouseEvents = () => {
      this.setState({
        keyDown: false,
      });
    };

    setSuggestionReference = (ref) => {
      this.suggestion = ref;
    };

    setDropdownReference = (ref) => {
      this.dropdown = ref;
    };

    filteredSuggestions = [];

    filterSuggestions = (mentionText) => {
      const suggestions = config.getSuggestions ? config.getSuggestions() : [];
      this.filteredSuggestions = searchElement(suggestions, mentionText, config.caseSensitive);
      if (this.filteredSuggestions.length === 0) {
        this.closeSuggestionDropdown();
      }
    };

    debouncedFetchSuggestion = debounce((mentionText) => {
      config.fetchSuggestions(mentionText).then((result) => {
        this.filteredSuggestions = result;
        this.setState({
          lastFetchedMentionText: mentionText,
          showSuggestions: result.length > 0,
          showLoader: false,
        });
        if (result.length === 0) {
          this.closeSuggestionDropdown();
        }
      });
    });

    updateSuggestions = () => {
      const { showSuggestions, lastFetchedMentionText } = this.state;
      const currentMentionText = this.getMentionText();

      // For dynamic suggestions
      if (config.fetchSuggestions) {
        if (
          !showSuggestions &&
          currentMentionText.length > 0 &&
          currentMentionText.startsWith(lastFetchedMentionText)
        ) {
          return;
        }
        if (showSuggestions || currentMentionText !== lastFetchedMentionText) {
          this.openSuggestionDropdown();
          this.setState({
            showLoader: true,
          });
          this.debouncedFetchSuggestion(currentMentionText);
        }
      } else {
        // For static suggestions
        this.openSuggestionDropdown();
        this.filterSuggestions(currentMentionText);
      }
    };

    getMentionText = () => this.props.children[0].props.text.substr(1);

    addMention = (event, label, value) => {
      const { activeOption } = this.state;
      const editorState = config.getEditorState();
      const { onChange, trigger } = config;

      const selectedMention =
        label !== undefined && value !== undefined ? { label, value } : this.filteredSuggestions[activeOption];

      if (!selectedMention || !selectedMention.label) return;

      const suggestion = this.suggestion;
      const blockKey = findBlockKey(this.suggestion);
      if (!blockKey) return;

      let contentState = editorState.getCurrentContent();
      const block = contentState.getBlockForKey(blockKey);
      if (!block) return;

      // Traverse block text to find the suggestion start offset
      let mentionIndex = getMentionIndex(suggestion);

      const mentionText = this.getMentionText();

      // Calculate the end position where the cursor should move
      const focusOffset = mentionIndex + trigger.length + mentionText.length;

      // Create selection for replacing the text with the mention
      let updatedSelection = createSelection(blockKey, mentionIndex, focusOffset);

      // Create entity for the mention
      const mentionEntityKey = createMentionEntity(
        contentState,
        `${trigger}${selectedMention.value}`,
        selectedMention.value,
        ''
      );

      // Replace text with mention and update the editor state
      contentState = Modifier.replaceText(
        contentState,
        updatedSelection,
        selectedMention.label,
        null,
        mentionEntityKey
      );

      let newEditorState = EditorState.push(editorState, contentState, 'insert-characters');

      // Calculate the position of the cursor after mention insertion
      const endOffset = mentionIndex + selectedMention.label.length;
      updatedSelection = updatedSelection.merge({
        anchorOffset: endOffset,
        focusOffset: endOffset,
      });

      newEditorState = ensureSpaceAfterMention(newEditorState, blockKey, endOffset, updatedSelection);

      onChange(newEditorState);
    };

    toggleSuggestionDropdownHandler = (open) => {
      if (!open) {
        this.closeSuggestionDropdown();
      }
    };

    getOptionClass = (index) => {
      const { activeOption } = this.state;

      const OptionClass = classNames({
        ['Editor-dropdown-option']: true,
        ['Editor-dropdown-option--highlight']: index === activeOption,
        ['Editor-dropdown--keydown']: this.state.keyDown,
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
          onClick: (ev) => {
            this.addMention(ev);
            if (optionRenderer.props.onClick) {
              optionRenderer.props.onClick();
            }
          },
          'data-index': index,
          onMouseOver: this.onOptionMouseOver,
        });
        return CustomOption;
      }

      return (
        <span
          key={index}
          spellCheck={false}
          onClick={() => this.addMention('onMouseSelect')}
          data-index={index}
          onMouseOver={this.onOptionMouseOver}
          className={this.getOptionClass(index)}
        >
          {icon && <Icon name={icon} className="mr-4" />}
          <Text>{label}</Text>
        </span>
      );
    };

    mentionPopover = (popoverRenderer) => {
      const { showLoader, showSuggestions } = this.state;

      if (popoverRenderer) {
        return popoverRenderer(
          this.filteredSuggestions,
          this.addMention,
          showLoader,
          showSuggestions,
          this.state.activeOption
        );
      }

      if (showLoader) {
        return (
          <span className="Editor-dropdown-option">
            <Placeholder withImage={false}>
              <PlaceholderParagraph length="large" />
              <PlaceholderParagraph length="large" />
              <PlaceholderParagraph length="large" />
            </Placeholder>
          </span>
        );
      }

      return this.filteredSuggestions.map((suggestion, index) => this.renderOption(suggestion, index));
    };

    render() {
      const { children } = this.props;
      const { showSuggestions } = this.state;
      const { dropdownOptions = {} } = config;
      const { dropdownClassName, popoverRenderer, appendToBody = true } = dropdownOptions;

      const DropdownClass = classNames({
        ['Popover']: true,
        [`${dropdownClassName}`]: dropdownClassName !== undefined,
        ['Editor-mention-dropdown']: true,
      });

      return (
        <span
          className="Editor-mention-suggestion"
          ref={this.setSuggestionReference}
          onClick={config.modalHandler.onSuggestionClick}
          aria-haspopup="true"
        >
          <span>{children}</span>
          {showSuggestions && (
            <Popover
              position="bottom-start"
              open={true}
              appendToBody={appendToBody}
              boundaryElement={this.setSuggestionReference}
              className={DropdownClass}
              contentEditable="false"
              suppressContentEditableWarning
              ref={this.setDropdownReference}
              onMouseMove={this.enableMouseEvents}
              onMouseLeave={this.disableMouseEvents}
              onScroll={this.enableMouseEvents}
              onToggle={this.toggleSuggestionDropdownHandler}
            >
              {this.mentionPopover(popoverRenderer)}
            </Popover>
          )}
        </span>
      );
    }
  };
}

export default Suggestion;
