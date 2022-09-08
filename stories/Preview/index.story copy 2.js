/* @flow */
import React from 'react';
import { Button } from '@innovaccer/design-system';
import { Editor, EditorPreview } from '../../src';
import { convertFromHTML, AtomicBlockUtils, ContentState, EditorState } from 'draft-js';
import { currentBlockContainsLink } from 'draft-js/lib/RichTextEditorUtil';

export const All = ({ onChangeMessage, }) => {
  const [content, setContent] = React.useState(Editor.utils.EditorState.createEmpty());
  const [toggleEditor, setToggleEditor] = React.useState(true);
  const [htmlContent, setHtml] = React.useState('')

  const onEditorStateChange = (editorState) => {
    const raw = Editor.utils.convertToRaw(editorState.getCurrentContent());
    // const html = EditorPreview.utils.convertToHTML(raw, true);
    const html = Editor.utils.stateToHTML(editorState)
    // const content = Editor.utils.htmlToState(html).editorState;
    // const updatedContent = Editor.utils.htmlToState(html.replaceAll('<br/>', '')).editorState;
    if(toggleEditor) {
      setHtml(html)
      setContent(editorState);
    }
  }

  const CustomContentStateConverter = (contentState) => {
    // changes block type of images to 'atomic'
    const newBlockMap = contentState.getBlockMap().map((block) => {
      const entityKey = block.getEntityAt(0);
      if (entityKey !== null) {
        const entityBlock = contentState.getEntity(entityKey);
        const entityType = entityBlock.getType();
        console.log('new fnn block', block);
        console.log('new fnn entityBlock', entityBlock);
        console.log('new fnn entityType', entityType);
        switch (entityType) {
          case 'IMAGE': {
            const newBlock = block.merge({
              type: 'atomic',
              text: 'img',
              data: {
                name: 'test'
              }
            });
            return newBlock;
          }
          default:
            return block;
        }
      }
      return block;
    });
    const newContentState = contentState.set('blockMap', newBlockMap);
    return newContentState;
  };

  React.useEffect(() => {
    if(toggleEditor){
      // console.log('bbb htmlContent before', htmlContent);

      // // setContent(Editor.utils.htmlToState(htmlContent).editorState)
      setContent(Editor.utils.htmlToState(htmlContent))
      // console.log('bbb Editor.utils.htmlToState(htmlContent).editorState', Editor.utils.htmlToState(htmlContent).editorState)

      // const blocksFromHTML = convertFromHTML(htmlContent);
      // const state = ContentState.createFromBlockArray(
      //   blocksFromHTML.contentBlocks,
      //   blocksFromHTML.entityMap,
      // );

      // const modifiedContentState = CustomContentStateConverter(state);
      // console.log('modifiedContentState-> ', modifiedContentState);
      // const result = EditorState.createWithContent(modifiedContentState);
      // // console.log('result-->', result)

      // setContent(result)

      // this.state = {
      //   editorState: EditorState.createWithContent(state),
      // };
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
                    defaultSize: { height: '300px', width: '300px' },
                }
            }
            }}
        />}
      </div>
      <div className='w-100 overflow-auto'>
        <pre>{JSON.stringify(htmlContent)}</pre>
      </div>
    </div>
  )

}

// export const All = (args) => {
//   // import { Editor, EditorPreview } from '@innovaccer/rich-text-editor';

//   const [editorState, setEditorState] = React.useState(Editor.utils.EditorState.createEmpty());
//   const [raw, setRaw] = React.useState();

//   const onEditorStateChange = (editorState) => {
//     setEditorState(editorState);
//   };

//   const onClick = () => {
//     const raw = Editor.utils.convertToRaw(editorState.getCurrentContent());
//     setRaw(raw);
//   };

//   return (
//     <div>
//       <Editor
//         editorClassName="RichTextEditor"
//         placeholder="Begin Typing.."
//         editorState={editorState}
//         onEditorStateChange={onEditorStateChange}
//         mention={{
//           suggestions: [
//             { label: 'First Name', value: 'First Name' },
//             { label: 'Last Name', value: 'Last Name' },
//             { label: 'PCP', value: 'PCP' },
//             { label: 'Address', value: 'Address' },
//             { label: 'DOB', value: 'DOB' },
//           ],
//         }}
//       />
//       <Button appearance="primary" size="large" onClick={onClick} className="my-4">
//         Get Preview
//       </Button>
//       <div className="pl-7">
//         <EditorPreview {...args} raw={raw} />
//       </div>
//     </div>
//   );
// };

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
