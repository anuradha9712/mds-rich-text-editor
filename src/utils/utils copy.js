import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import { ContentState, EditorState, convertToRaw } from 'draft-js';
import {stateFromHTML} from 'draft-js-import-html';

// export const htmlToState = (html) => {
//   console.log('star html', html);
//   let contentState = stateFromHTML(html);
//   console.log('star contentState', contentState)
//   return contentState;
// }

export const htmlToState = (html) => {
  // Remove extra newline in html generated from Preview component
  console.log('htmllll', html);
  const imgContent = html.replaceAll('<p><br/></p><p id="RichTextEditor-Image"','<p id="RichTextEditor-Image"');
  const htmlContent = imgContent.replaceAll('<br/>', '');
  const contentBlock = htmlToDraft(htmlContent);
  if (contentBlock) {
    const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
    const editorState = EditorState.createWithContent(contentState);
    return { contentState, editorState };
  }
};

export const stateToHTML = (editorState) => {
  const json = convertToRaw(editorState.getCurrentContent());

  return draftToHtml(json, {}, false, ({ type, data }) => {
    // if (type === 'IMAGE') {
    //   const alignment = data.alignment ? data.alignment : 'left';
    //   return `
    //     <p style="justify-content:${alignment}; display:flex; text-align:${alignment}">
    //       <img src="${data.src}" alt="${data.alt}" style="height: ${data.height};width: ${data.width}"/>
    //     </p>
    //   `;
    // }

    // if (type === "IMAGE") {  
    //   const { alignment } = data;  
    //   if (alignment && alignment.length) {    
    //     return `<figure style="text-align:${alignment};">            
    //               <img src="${data.src}" alt="${data.alt}" style="height: ${data.height};width: ${data.width}"/>        
    //             </figure>`;  
    //   }  return `<figure>        
    //         <img src="${data.src}" alt="${data.alt}" style="height: ${data.height};width: ${data.width}"/>   
    //         </figure>    
    //         `;
    // }

    if (type === "IMAGE") {  
      const { alignment } = data;  
      if (alignment && alignment.length) {    
        return `<figure style="text-align:${alignment};">            
                  <img style="height: 30px;width: 30px" src="${data.src}" alt="${data.alt}" />        
                </figure>`;  
      }  return `<figure>        
            <img style="height: 30px;width: 30px" src="${data.src}" alt="${data.alt}" />   
            </figure>    
            `;
    }
  });
};
