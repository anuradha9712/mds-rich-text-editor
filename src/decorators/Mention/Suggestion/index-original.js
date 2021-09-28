const { Component } = React;
const { Editor, EditorState, Modifier, CompositeDecorator } = Draft;


/* ----------*
* Constants
------------*/

// const INSERT_ACTION_LABEL = `insert-suggestion`
// const PREFIX = '@'

// const SUGGESTIONS = [
//   'Jaervinen',
//   'Nieminen',
//   'Lamminpaeae',
//   'Kallio',
//   'Jokinen',
//   'Niittukari',
//   'Li'
// ]

/* ----------*
* Utils
------------*/

function getSelectionRange () {
  const selection = window.getSelection()
  if (selection.rangeCount === 0)
    return null
  return selection.getRangeAt(0)
}

function getTriggerRange (term) {
  const range = getSelectionRange()
  const text  = range && range.startContainer.textContent.substring(0, range.startOffset)
  if (!text || /\s+$/.test(text))
    return null

  const start = text.lastIndexOf(term)
  if (start === -1)
    return null

  const end = range.startOffset
  return {
    end,
    start,
    text:  text.substring(start),
  }
}


function getInsertRange (activeSuggestion, editorState) {
  const selection = editorState.getSelection()
  const content   = editorState.getCurrentContent()
  const anchorKey = selection.getAnchorKey()
  const end       = selection.getAnchorOffset()
  const block     = content.getBlockForKey(anchorKey)
  const text      = block.getText()
  const start     = text.substring(0, end).lastIndexOf(PREFIX)

  return {
    start,
    end,
  }
}

const CaretCoordinates = {
  x: 0,
  y: 0,
}

function getCaretCoordinates () {
  const range = getSelectionRange()
  if (range) {
    const { left: x, top: y }  = range.getBoundingClientRect()
    Object.assign(CaretCoordinates, { x, y })
  }
  return CaretCoordinates
}


/* ----------*
* Modifiers
------------*/

const addSuggestion = (editorState, activeSuggestion, content) => {
  const { start, end }   = getInsertRange(activeSuggestion, editorState)
  const contentState     = editorState.getCurrentContent()
  const currentSelection = editorState.getSelection()
  const selection        = currentSelection.merge({
    anchorOffset: start,
    focusOffset: end,
  })
  
  const contentStateWithEntity = contentState.createEntity(
    'SUGGESTION', 'IMMUTABLE', { content })
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const newContentState = Modifier.replaceText(
    contentStateWithEntity,
    selection,
    `${PREFIX}${content}`,
    null,
    entityKey)
  
  const newEditorState = EditorState.push(
    editorState,
    newContentState,
    INSERT_ACTION_LABEL)
  
  return EditorState.forceSelection(
    newEditorState,
    newContentState.getSelectionAfter())
}


/* ----------*
* Decorators
------------*/

const Suggestion = ({ children }) => {
  return <span className='label suggestion'>
    {children}
  </span>
}


const findSuggestionEntities = (contentState, contentBlock, callback) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'SUGGESTION'
      );
    },
    callback
  )
}


/* ----------*
* Components
------------*/

class Suggestions extends Component {
  
  // getMatchingSuggestions () {
  //   console.log(this.props)
  //   let text = this.props.searchText
  //   if (typeof text !== 'string')
  //     return null

  //   const term = text.toLowerCase()
  //   const filter = item =>  {
  //     let query = item.substring(0, term.length).toLowerCase()
  //     return query === term
  //   }

  //   let results = SUGGESTIONS.filter(filter)
  //   if (results.length === 1 && (results[0].length === term.length))
  //     return null
  //  return results
  // }
  
  // get position () {
  //   const co = this.props.position
  //   if (!co)
  //     return {}
  //   return {
  //     top:  co.y,
  //     left: co.x,
  //   }
  // }
  
  // render () {
  //   const entries = this.getMatchingSuggestions()
  //   return entries && 
  //     <nav 
  //       style={ this.position }
  //       className='overlay suggestions'>
  //       <ol className='suggestions-list'>
  //         { entries.map(result => {

  //           const select = () => this.props.onSelect(result)
  //           return <li onMouseDown={ select }>
  //             {result}
  //           </li> 

  //         })}
  //       </ol>
  //     </nav>
  // }
}


class EditorView extends Component {

  constructor(props) {
    super(props)
    
    // const decorator = new CompositeDecorator([{
    //   strategy:  findSuggestionEntities,
    //   component: Suggestion,
    // }])
    
    this.state = {
      editorState: EditorState.createEmpty(decorator),
      activeSuggestion: null
    }
    
  }
  
  // focus () {
  //   this.editor.focus()
  // }
  
  // onChange (editorState) {
  //   this.setState({ editorState }, this.updateSuggestionsState.bind(this))
  // }
  
  // updateSuggestionsState () {
  //   const triggerRange     = getTriggerRange(PREFIX)
  //   const activeSuggestion = !triggerRange
  //     ? null
  //     : {
  //       position: getCaretCoordinates(),
  //       searchText: triggerRange.text.slice(1, triggerRange.text.length),
  //       selectedIndex: 0 }
  //   this.setState({ activeSuggestion })
  // }
  
  // handleSuggestionSelected (text) {
  //   const { editorState, activeSuggestion } = this.state; 
  //   this.onChange(
  //     addSuggestion(editorState, activeSuggestion, text) 
  //   )
  //   this.setState({ activeSuggestion: null }, () => {
  //     requestAnimationFrame(() => this.focus())
  //   })
  // }
  
  render() {
    return <div 
      className="editor" 
      onClick={ this.focus.bind(this) }>
      
      <Editor
        ref={ node => this.editor = node }
        editorState={ this.state.editorState } 
        onChange={this.onChange.bind(this)}
        />
      
      <Suggestions 
        { ...this.state.activeSuggestion }
        onSelect={ this.handleSuggestionSelected.bind(this) }
        />

    </div>
  }

}

class App extends Component {
  render() {
    return <div className="app">
      <EditorView />
    </div>
  }
}

 
ReactDOM.render(
  <App />,
  document.getElementById('app'),
)
 

document.querySelector('.delim').textContent = PREFIX