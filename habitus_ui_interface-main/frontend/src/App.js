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

// This is the real application. "App" is currently a modified version to allow people with small screens to read the text.

function App({apiUrl}) {
    const [anchor, setAnchor] = useState();
    const [corpus, setCorpus] = useState([]);
    const [context, setContext] = useState([]);
    const [gridRows, setGridRows] = useState({})
    const [colNumToName, setColNumToName] = useState({})
    const [frozenColumns, setFrozenColumns] = useState([])
    const [rowContents, setRowContents] = useState({})
    const [anchorBook, setAnchorBook] = useState({})
    const [synonymBook, setSynonymBook] = useState([])

    useEffect(() => {
        fetch(`${apiUrl}/data/`)
            .then( response => response.json())
            .then( data => {
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

            }> {anchor} </div>

    <div className="App" style={{
        display: "flex",
        flexDirection: "row"
    }}>
    <div style={{
        display: "flex",
        flexDirection: "column"
    }}>
    

    <Grid data={gridRows} col_num_to_name={colNumToName} frozen_columns={frozenColumns} row_contents = {rowContents} onChange={
      (evt) => {setCorpus(evt);
                setContext('')}
       }
       onDrop={
        (evt) => {
                  console.log(evt);
                  console.log('drop!');
                  setCorpus(evt.clicked_sentences);
                  setGridRows(evt.grid);
                  setColNumToName(evt.col_num_to_name);
                  setContext('')}
       }
       onFooter={
        (evt) => {
            console.log('onfooter:', evt);
            setGridRows({...evt.grid});
            setColNumToName({...evt.col_num_to_name});
            setFrozenColumns([...evt.frozen_columns]);}
        }

        onDeleteFrozen={
        (evt) => {
            console.log('delete frozen:', evt);
            setCorpus(evt.clicked_sentences);
            setGridRows({...evt.grid});
            setColNumToName({...evt.col_num_to_name});
            setFrozenColumns([...evt.frozen_columns]);}
       }
    apiUrl={apiUrl} />
    <div style={{display:"flex", flexDirection:"column"}}>
    <div style={{display:"flex", flexDirection:"row"}}>
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

      <div style={{display:"flex", flexDirection:"row"}}>

      <RegenerateButton className="RegenerateButton" onClick={(evt) => {
          console.log(evt);
          setCorpus(evt.clicked_sentences);
          setGridRows(evt.grid);
          setColNumToName(evt.col_num_to_name);
          setFrozenColumns(evt.frozen_columns)}
      }
      apiUrl={apiUrl}/>

      <KButton className="KButton" apiUrl={apiUrl}/>

      <SaveBox className="SaveBox" onClick={(evt) => {console.log('save box: ', evt)}}
      apiUrl={apiUrl}/>

      <LoadBox className="LoadBox"
      onKeyPress={(evt) => {
          console.log(evt);
          setAnchor(evt.anchor);
          setCorpus(evt.clicked_sentences);
          setGridRows(evt.grid);
          setColNumToName(evt.col_num_to_name);
          setFrozenColumns(evt.frozen_columns)}
      }
      apiUrl={apiUrl}/>

      </div>

      </div>
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

      <Corpus sentences={corpus}
      onChange={(evt) => {console.log(evt);
                          console.log('sentence click!');
                          setContext(evt)}}
       apiUrl={apiUrl} />
       <div style={{display:'inline', width:'350px'}}>
      {context[0]} <b>{context[1]}</b> {context[2]}
      </div>
      </div>
      </div>
      </div>


    
          </DndProvider>
  );
}

export default App;
