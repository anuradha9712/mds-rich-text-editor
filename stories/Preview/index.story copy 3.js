import React from 'react';
// import { Editor, EditorPreview } from "@innovaccer/rich-text-editor";
// import '@innovaccer/rich-text-editor/dist/rich-text-editor.css';
import { Editor, EditorPreview } from '../../src';

export const All =({ onChangeMessage, }) => {
    const [content, setContent] = React.useState(Editor.utils.EditorState.createEmpty());
    const [toggleEditor, setToggleEditor] = React.useState(true);
    const [htmlContent, setHtml] = React.useState('')

  const onEditorStateChange = (editorState) => {
    const raw = Editor.utils.convertToRaw(editorState.getCurrentContent());
    const html = EditorPreview.utils.convertToHTML(raw, true);
    // const content = Editor.utils.htmlToState(html).editorState;
    // const updatedContent = Editor.utils.htmlToState(html.replaceAll('<br/>', '')).editorState;
    if(toggleEditor){
      setHtml(html)
    setContent(editorState);
    }
  }

  React.useEffect(() => {
    if(toggleEditor){
      setContent(Editor.utils.htmlToState(htmlContent.replaceAll('<br/>', '')).editorState)
    }

  }, [toggleEditor])
  

  return (
    <div>
    <div>
    <button onClick={ () => {setToggleEditor(!toggleEditor);} }>Toggle</button>
    
    {toggleEditor && <Editor
        editorState={content}
        toolbarClassName="toolbarClassName"
        wrapperClassName="wrapperClassName"
        editorClassName="letterEditor"
        data-test="editor-toolbar"
        onEditorStateChange={onEditorStateChange}
        toolbar={{
            insert: {
            image: {
                defaultSize: { height: 'auto', width: 'auto' },
            }
        }
        }}
    />}
    </div>
    <div >
    <pre>{JSON.stringify(htmlContent)}</pre>
    </div>
    </div>
  )
}

All.argTypes = {
  raw: { control: { disable: true } },
  colors: { control: { disable: true } },
};

export default {
  title: 'Library/Preview',
  component: EditorPreview,
  parameters: {
    docs: {
      source: {
        type: 'code',
      },
    },
  },
};
