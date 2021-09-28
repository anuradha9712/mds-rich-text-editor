import {
  EditorState,
  Modifier,
} from 'draft-js';
import { getSelectedBlock } from 'draftjs-utils';

export default function addMention(
  editorState: EditorState,
  onChange: Function,
  separator: string,
  trigger: string,
  suggestion: Object,
): void {
  const { label, value, url } = suggestion;
  console.log("suggestionsss-> ", suggestion);
  console.log("editorState-> ", editorState);

  const entityKey = editorState
    .getCurrentContent()
    .createEntity('MENTION', 'IMMUTABLE', { text: `${trigger}${value}`, value, url })
    .getLastCreatedEntityKey();

  console.log("entitykey-> ", entityKey);
  const selectedBlock = getSelectedBlock(editorState);
  const selectedBlockText = selectedBlock.getText();
  console.log("selectedBlock-> ", selectedBlock);
  console.log("selectedBlockText-> ", selectedBlockText);

  // let focusOffset = editorState.getSelection().focusOffset;
  const mentionIndex = (selectedBlockText.lastIndexOf(separator + trigger) || 0) + 1;
  let focusOffset = mentionIndex + label.length;
  console.log("focusOffset-> ", focusOffset);
  console.log("mentionINdex-> ", mentionIndex)

  if (selectedBlockText.length === mentionIndex + 1) {
    focusOffset = selectedBlockText.length;
  }

  let updatedSelection = editorState.getSelection().merge({
    anchorOffset: mentionIndex,
    focusOffset
  });

  let newEditorState = EditorState.acceptSelection(editorState, updatedSelection);
  let contentState = Modifier.replaceText(
    newEditorState.getCurrentContent(),
    updatedSelection,
    `${label}`,
    null,
    entityKey,
  );
  newEditorState = EditorState.push(newEditorState, contentState, 'insert-characters');

  //insert a blank space after mention
  updatedSelection = newEditorState.getSelection().merge({
    anchorOffset: mentionIndex + label.length,
    focusOffset: mentionIndex + label.length
  });
  newEditorState = EditorState.acceptSelection(newEditorState, updatedSelection);
  // newEditorState = EditorState.forceSelection(newEditorState, updatedSelection);

  contentState = Modifier.insertText(
    newEditorState.getCurrentContent(),
    updatedSelection,
    ' ',
    newEditorState.getCurrentInlineStyle(),
    undefined,
  );

  console.log("newEditorState-> ", newEditorState);

  onChange(EditorState.push(newEditorState, contentState, 'insert-characters'));
}
