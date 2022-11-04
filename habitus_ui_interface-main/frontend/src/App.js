import './App.css';
import Corpus from './Corpus.js'
import Grid from  "./Grid"
import RegenerateButton from  "./RegenerateButton"
import CopyButton from  "./CopyButton"
import './CopyButton.css'
import './RegenerateButton.css'
import InputBox from './InputBox'
import './InputBox.css'
import LoadBox from './LoadBox'
import './LoadBox.css'
import KButton from './KButton'
import './KButton.css'
import SaveBox from './SaveBox'
import './SaveBox.css'
import AnchorBook from './AnchorBook'
import SynonymBook from './SynonymBook'
import Trash from './Trash'
import {useEffect, useState} from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Link } from "react-router-dom";


// This is the real application. "App" is currently a modified version to allow people with small screens to read the text.

function App({apiUrl, edit}) {
    const [flag, setFlag] = useState();
    const [anchor, setAnchor] = useState();
    const [corpus, setCorpus] = useState([]);
    const [context, setContext] = useState([]);
    const [gridRows, setGridRows] = useState({})
    const [colNumToName, setColNumToName] = useState({})
    const [frozenColumns, setFrozenColumns] = useState([])
    const [rowContents, setRowContents] = useState({})
    const [anchorBook, setAnchorBook] = useState({})
    const [synonymBook, setSynonymBook] = useState([])

    const handleLinkClick = () => {
        fetch(`${apiUrl}/saveGrid/${anchor}`).then( response => response.json());
    }

    useEffect(() => {
        fetch(`${apiUrl}/data/${edit}`)
            .then( response => response.json())
            .then( data => {
                setFlag(data.flag);
                setAnchor(data.anchor);
                setCorpus(data.clicked_sentences);
                setGridRows(data.grid);
                setColNumToName(data.col_num_to_name);
                setFrozenColumns(data.frozen_columns);
                setRowContents(data.row_contents);
                setAnchorBook(data.anchor_book);
                setSynonymBook(data.synonym_book);
            });
    }, [])


  return (
      <DndProvider backend={HTML5Backend}>
      {edit === true ?
      <div style={{display:'flex', flexDirection:'row', width: '80px', marginBottom:'0.03em', marginLeft:'4em', marginTop:'0.5em', fontFamily:'InaiMathi', fontSize:'20pt'}} 
          contenteditable="true" onInput={
                (evt) => {
                    console.log(evt.target.lastChild, evt.target.lastChild.toString());
                    if (evt.target.lastChild.toString() === "[object HTMLDivElement]") {
                        let text = evt.target.textContent;
                        fetch(`${apiUrl}/loadNewGrid/${text}`)
                        .then( response => response.json());
                        console.log("!", text);
                        evt.target.value = '';
                        evt.target.blur();
                        window.location.reload();
                    }
                }

            }> {anchor} </div> : <div style={{marginBottom:'3em'}}/>}

    <div className="App" style={{
        display: "flex",
        flexDirection: "row"
    }}>
    <div style={{
        display: "flex",
        flexDirection: "column",
        marginRight:'20px'
    }}>
    

    <Grid data={gridRows} col_num_to_name={colNumToName} frozen_columns={frozenColumns} row_contents = {rowContents} onChange={
      (evt) => {console.log(evt);
                console.log('app!');
                setCorpus(evt);
                setContext('')}
       }
       onDrop={
        (evt) => {
                  console.log(evt);
                  console.log('drop!');
                  setCorpus(evt.clicked_sentences);
                  setGridRows(evt.grid);
                  setColNumToName(evt.col_num_to_name)}
       }
       onFooter={
        (evt) => {
            console.log('onfooter:', evt);
            setGridRows({...evt.grid});
            setColNumToName({...evt.col_num_to_name})
        }
       }
    apiUrl={apiUrl} />
    {edit === true ?
    <div style={{display:"flex", flexDirection:"column"}}>
    <div style={{display:"flex", flexDirection:"row"}}>

    {flag === 'control' ? <div style={{marginLeft:"18em"}}/>
     :  <div style={{display:"flex", flexDirection:"row", marginLeft:"3em", marginTop:"1em"}}>
        <RegenerateButton className="RegenerateButton" onClick={(evt) => {
          console.log(evt);
          setCorpus(evt.clicked_sentences);
          setGridRows(evt.grid);
          setColNumToName(evt.col_num_to_name);
          setFrozenColumns(evt.frozen_columns)}
      }
      apiUrl={apiUrl}/>

      </div>}

    <InputBox data={gridRows} col_num_to_name={colNumToName} 
      onKeyPress={(evt) => {
          console.log(evt);
          setCorpus(evt.clicked_sentences);
          setGridRows(evt.grid);
          setColNumToName(evt.col_num_to_name);
          setFrozenColumns(evt.frozen_columns)}
      }
      apiUrl={apiUrl}/>

      <CopyButton className="CopyButton" onClick={(evt) => {
          console.log("copy button: ", evt)}
      }
      apiUrl={apiUrl}/>

      <Trash className='Trash' onDrop={
        (evt) => {
                  console.log(evt);
                  console.log('trash!', evt);
                  setCorpus(evt.clicked_sentences);
                  setGridRows(evt.grid);
                  setColNumToName(evt.col_num_to_name)}
       }
       apiUrl={apiUrl}/>
       </div>

      </div>
        : <div/>}
      {edit === true ?
      <div style={{marginLeft:'4em', marginTop:'3em', borderColor:'blue'}}><u>GUIDE</u><ul>
      <li style={{background: '#FFFFFF', width: '700px'}}>- <b>Clicking:</b> Click on cells to view sentences. Colors indicate the amount of knowledge in each cell. Click on sentences to see them in the larger interview context.</li>
      <li style={{background: '#FFFFFF', width: '700px'}}>- Some sentences have more than one topic and can appear in more than one column.</li>
      <li style={{background: '#FFFFFF', width: '700px'}}>- You can organize information in two ways:</li>
      <ul>
      <li style={{background: '#FFFFFF', width: '700px'}}>- <b>Dragging:</b> Drag sentences between columns. Sentences do not move between rows. To copy a sentence to a new column, click the "Copy" button before dragging.</li>
      <li style={{background: '#FFFFFF', width: '700px'}}>- <b>Create new column:</b> Type a word into the "Create New Column" box and press Enter to create a column with all sentences that include the word. If the word is not in the corpus, no column will be created.</li>
      </ul>
      <li style={{background: '#FFFFFF', width: '700px'}}>- <b>Trash:</b> You can drag a sentence into the trash can if you want to get rid of it. This will remove the sentence from the entire Grid permanently.</li>
      <li style={{background: '#FFFFFF', width: '700px'}}>- A column will disappear if you remove all sentences from it.</li>
       </ul>
      {flag === 'control' ? <div/> :<ul>
      <li style={{background: '#FFFFFF', width: '700px'}}>- <b>Update Grid:</b> You can click "Update Grid" to ask the machine to reorganize the columns.</li>
      <ul>
      <li style={{background: '#FFFFFF', width: '700px'}}>- The machine will reorganize information that you haven't organized, paying attention to the changes you have made. It may produce new columns using the sentences you have not interacted with; these columns have blue names.</li>
      <li style={{background: '#FFFFFF', width: '700px'}}>- Once you put a sentence in a column, it will stay there; the machine will not move that sentence. </li>
      <li style={{background: '#FFFFFF', width: '700px'}}>- Creating a new column automatically "freezes" it, meaning the machine will not assign or remove sentences to and from that column. Frozen columns have black names.</li>
      <li style={{background: '#FFFFFF', width: '700px'}}>- <b>Renaming:</b> You can also freeze a column by double-clicking its name, typing a new one, and pressing Enter.</li>
      </ul></ul>}
      </div>
      : <div/>}
      </div>

      <div style={{
        display: "flex",
        flexDirection: "column"
      }}>

      <div style={{
        display: "flex",
        flexDirection: "row",
        fontFamily: 'InaiMathi'
      }}>
       <div style={{
        display: "flex",
        flexDirection: "column"
      }}>
      <div style={{fontFamily:'InaiMathi', fontSize:'18pt', marginLeft:'7em'}}><u>Sentences</u></div>
      <Corpus sentences={corpus}
      onChange={(evt) => {console.log(evt);
                          console.log('sentence click!');
                          setContext(evt)}}
       edit={edit}
       apiUrl={apiUrl} />
       </div>
              <div style={{
        display: "flex",
        flexDirection: "column"
      }}>
      <div style={{fontFamily:'InaiMathi', fontSize:'18pt', marginLeft:'3em'}}><u>Interview context</u></div>
       <div style={{display:'inline', width:'350px'}}>
      {context[0]} <b>{context[1]}</b> {context[2]}
      </div>
      </div>
      </div>
      </div>
      </div>
      {edit === true ?
        <div style={{marginBottom:'20px'}}>
      <Link to="/test" onClick = {() => handleLinkClick()} style={{marginLeft:'80%', background:'pink'}}>Click to begin answering questions.</Link></div>
      : <div/>}
    
          </DndProvider>
  );
}

export default App;
