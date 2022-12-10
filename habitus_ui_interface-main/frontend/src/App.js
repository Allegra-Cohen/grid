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
import AnchorBook from './AnchorBook'
import SynonymBook from './SynonymBook'
import Trash from './Trash'
import {useEffect, useState} from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Link } from "react-router-dom";
import './Spinner.css';

// This is the real application. "App" is currently a modified version to allow people with small screens to read the text.

function App({apiUrl}) {
    const [filename, setFilename] = useState();
    const [anchor, setAnchor] = useState();
    const [corpus, setCorpus] = useState([]);
    const [context, setContext] = useState([]);
    const [gridRows, setGridRows] = useState({})
    const [colNumToName, setColNumToName] = useState({})
    const [frozenColumns, setFrozenColumns] = useState([])
    const [rowContents, setRowContents] = useState({})
    const [anchorBook, setAnchorBook] = useState({})
    const [synonymBook, setSynonymBook] = useState([])
    const [waiting, setWaiting] = useState(false)
    const [saveAs, setSaveAs] = useState()

    useEffect(() => {
        setWaiting(true)
        fetch(`${apiUrl}/data/`)
            .then( response => response.json())
            .then( data => {
                setFilename(data.filename);
                setAnchor(data.anchor);
                setCorpus(data.clicked_sentences);
                setGridRows(data.grid);
                setColNumToName(data.col_num_to_name);
                setFrozenColumns(data.frozen_columns);
                setRowContents(data.row_contents);
                setAnchorBook(data.anchor_book);
                setSynonymBook(data.synonym_book);
                setWaiting(false);
            });
    }, [])

    const handleSaveTyping = (evt) => {
        setSaveAs(evt.target.value);
    }

    const handleSaveAs = (saveAs) => {
        fetch(`${apiUrl}/saveAsGrid/${saveAs}`)
                    .then( response => response.json())
                    .then( data => {
                        setFilename(data.filename);
                    });
    }

    const handleSaveClick = () => {
        if (saveAs) {
            fetch(`${apiUrl}/showGrids/`)
            .then(response => response.json())
            .then(data => {
                if (data.grids.includes(saveAs)) {
                    let safe = window.confirm("A Grid with this name already exists. Would you like to overwrite?");
                    if (safe) {
                        handleSaveAs(saveAs);
                    }
                } else {
                    handleSaveAs(saveAs)
                }
            })
        } else {
            fetch(`${apiUrl}/saveGrid/`)
        }
    }


  return (
      <DndProvider backend={HTML5Backend}>
      <div style={{background: "#a9d3ff", padding:"1%", display: 'flex', flexDirection: 'row', marginBottom:'1%'}}>
      <Link style={{color:'black', marginTop:'0.5%'}} to="/">Back to Gallery</Link>
      <div style={{marginLeft:'80%'}}><input style={{width:'90%', height:"2em", color:'black', fontSize: '13pt', border: '1.5px solid #90c5e1'}} placeholder='Save as' onKeyUp={(evt) => handleSaveTyping(evt)} apiUrl={apiUrl}/></div>
      <button style={{marginLeft:'2%', fontSize:'20pt', background:'none', borderWidth:'1pt'}} onClick={(evt)=>handleSaveClick()}>💾</button>
      </div>

      {waiting ? <div/> : <div style={{display:'inline', width: '80px', marginBottom:'0.03em', marginLeft:'4em', marginTop:'3%', fontFamily:'InaiMathi', fontSize:'20pt'}}> {filename} ({anchor}) </div>}

    <div className="App" style={{
        display: "flex",
        flexDirection: "row"
    }}>
    <div style={{
        display: "flex",
        flexDirection: "column"
    }}>
    
    {waiting ? <div className='spinner' style={{marginLeft:'25%',marginTop:'3%'}}/>: <div/>}

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
      <div style={{
        display: "flex",
        flexDirection: "column"
      }}>
      <div style={{fontFamily:'InaiMathi', fontSize:'18pt', marginLeft:'7em'}}><u>Sentences</u></div>
      <Corpus sentences={corpus}
      onChange={(evt) => {console.log(evt);
                          console.log('sentence click!');
                          setContext(evt)}}
       apiUrl={apiUrl} />
       </div>
       <div style={{
        display: "flex",
        flexDirection: "column"
      }}>
       <div style={{fontFamily:'InaiMathi', fontSize:'18pt', marginLeft:'5em'}}><u>Context</u></div>
       <div style={{display:'inline', width:'350px'}}>
      {context[0]} <b>{context[1]}</b> {context[2]}
      </div>
      </div>
      </div>
      </div>
      </div>


    
          </DndProvider>
  );
}

export default App;
