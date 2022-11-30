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
import './info.css';
import {useEffect, useState} from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Link } from "react-router-dom";
import Countdown from 'react-countdown';

function App({apiUrl, edit, training, timeLimit}) {
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
    const [disabled, setDisabled] = useState(false);
    const [start, setStart] = useState(Date.now());
    const [userID, setUserID] = useState(JSON.parse(localStorage.getItem('userID')));

    const timer = ({ hours, minutes, seconds, completed }) => {
      if (completed || disabled) {
        setDisabled(true);
        return "Done!";
      } else {
        return <span>{minutes}:{seconds}</span>;
      }
    };

    const handleLinkClick = () => {
        fetch(`${apiUrl}/saveGrid/${anchor}/${userID}`).then( response => response.json());
    }

    useEffect(() => {
        let user = JSON.parse(localStorage.getItem('userID'));
        setUserID(user);
        console.log('app for user: ', user);
        fetch(`${apiUrl}/data/${userID}`)
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
    }, [userID])


  return (
      <DndProvider backend={HTML5Backend}>
      {edit === true & training === false ?<div className="info" style={{marginLeft:'84%'}}>
      Time left: <Countdown date={start + timeLimit} renderer={timer} /> <br/>
      <Link to="/instructions2" onClick = {() => handleLinkClick()}>Done? Move on to the next page.</Link>
      </div>:<div/>}
      {edit === true ?
      <div style={disabled ? {pointerEvents: "none", opacity: "0.4", display:'flex', flexDirection:'row', width: '80px', marginBottom:'0.03em', marginLeft:'4em', marginTop:'0.5em', fontFamily:'InaiMathi', fontSize:'20pt'}: {display:'flex', flexDirection:'row', width: '80px', marginBottom:'0.03em', marginLeft:'4em', marginTop:'0.5em', fontFamily:'InaiMathi', fontSize:'20pt'}}>
       {anchor} </div> : <div style={{marginBottom:'3em'}}/>}

    <div className="App" style={disabled ? {pointerEvents: "none", opacity: "0.4", display: "flex", flexDirection: "row"} : {display: "flex", flexDirection: "row"}}>
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
            setColNumToName({...evt.col_num_to_name});
            setFrozenColumns([...evt.frozen_columns]);
        }
       }
       edit={edit}
    apiUrl={apiUrl} userID = {userID}/>
    {edit === true ?
    <div style={{display:"flex", flexDirection:"column"}}>
    <div style={{display:"flex", flexDirection:"row"}}>

    
       <div style={{display:"flex", flexDirection:"row", marginLeft:"3em", marginTop:"1em"}}>
        <RegenerateButton className="RegenerateButton" onClick={(evt) => {
          console.log(evt);
          setCorpus(evt.clicked_sentences);
          setGridRows(evt.grid);
          setColNumToName(evt.col_num_to_name);
          setFrozenColumns(evt.frozen_columns)}
      }
      apiUrl={apiUrl} userID={userID}/>

      </div>

    <InputBox data={gridRows} col_num_to_name={colNumToName} 
      onKeyPress={(evt) => {
          console.log(evt);
          setCorpus(evt.clicked_sentences);
          setGridRows(evt.grid);
          setColNumToName(evt.col_num_to_name);
          setFrozenColumns(evt.frozen_columns)}
      }
      apiUrl={apiUrl} userID={userID}/>

      <CopyButton className="CopyButton" onClick={(evt) => {
          console.log("copy button: ", evt)}
      }
      apiUrl={apiUrl} userID={userID}/>

       </div>

      </div>
        : <div/>}
      {edit === true & training === false ?
      <div style={{marginLeft:'4em', marginTop:'3em', borderColor:'blue'}}><u>Cheat sheet</u>
      {flag === 'control' ?
      <ul>
      <li style={{background: '#FFFFFF', width: '700px'}}>-<b> Creating new columns:</b> Type a word into the "Create New Column" box and press Enter to create a column with all sentences that include the word.</li>
      <li style={{background: '#FFFFFF', width: '700px'}}>-<b> Deleting columns:</b> ...</li>
      <li style={{background: '#FFFFFF', width: '700px'}}>-<b> Renaming columns:</b> Type a new name below the column you want to rename and press Enter.</li>
      <li style={{background: '#FFFFFF', width: '700px'}}>-<b> Moving sentences:</b> Drag sentences between columns. To copy a sentence to a new column, click the "Copy" button before dragging.</li>
      <li style={{background: '#FFFFFF', width: '700px'}}>-<b> Update Grid:</b> Clicking this button will remove the contents of new columns from the beginning column.</li>
      </ul>
      : 
      <ul>
      <li style={{background: '#FFFFFF', width: '700px'}}>-<b> Creating new columns:</b> Type a word into the "Create New Column" box and press Enter to create a column with all sentences that include the word. This column is now frozen and will not change when the Grid is updated.</li>
      <li style={{background: '#FFFFFF', width: '700px'}}>-<b> Deleting columns:</b> ...</li>
      <li style={{background: '#FFFFFF', width: '700px'}}>-<b> Renaming columns:</b> Type a new name below the column you want to rename and press Enter. Renaming a column also freezes it.</li>
      <li style={{background: '#FFFFFF', width: '700px'}}>-<b> Moving sentences:</b> Drag sentences between columns to move them. To copy a sentence to a new column, click the "Copy" button before dragging.</li>
      <li style={{background: '#FFFFFF', width: '700px'}}>-<b> Seeding columns:</b> If you drag a sentence between unfrozen columns, the sentence will stay in its new column when the Grid is updated.</li>
      <li style={{background: '#FFFFFF', width: '700px'}}>-<b> Update Grid:</b> Clicking this button will ask the machine to reorganize the Grid. It will generate new columns from the sentences that you have not previously frozen or seeded.</li>
      </ul>
      }
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
       edit={edit} training={training}
       apiUrl={apiUrl} userID={userID}/>
       </div>
              <div style={{
        display: "flex",
        flexDirection: "column"
      }}>
      <div style={{fontFamily:'InaiMathi', fontSize:'18pt', marginLeft:'3em'}}><u>Sentence context</u></div>
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
