import './App.css';
import Corpus from './Corpus.js'
import Grid from  "./Grid"
import RegenerateButton from  "./RegenerateButton"
import CopyButton from  "./CopyButton"
import './CopyButton.css'
import './RegenerateButton.css'
import InputBox from './InputBox'
import './InputBox.css'
import Trash from './Trash'
import {useEffect, useState} from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

function App({apiUrl}) {
    const [corpus, setCorpus] = useState([]);
    const [gridRows, setGridRows] = useState({})
    const [colNumToName, setColNumToName] = useState({})

    useEffect(() => {
        fetch(`${apiUrl}/data/`)
            .then( response => response.json())
            .then( data => {
                setCorpus(data.clicked_sentences);
                setGridRows(data.grid);
                setColNumToName(data.col_num_to_name);
            });
    }, [])


  return (
      <DndProvider backend={HTML5Backend}>
    <div className="App" style={{
        display: "flex",
        flexDirection: "row"
    }}>
    <div style={{
        display: "flex",
        flexDirection: "column"
    }}>

    <Grid data={gridRows} col_num_to_name={colNumToName} onChange={
      (evt) => {console.log(evt);
                console.log('app!');
                setCorpus(evt)}
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
    <div style={{display:"flex", flexDirection:"column"}}>
    <InputBox data={gridRows} col_num_to_name={colNumToName} 
      onKeyPress={(evt) => {
          console.log(evt);
          setCorpus(evt.clicked_sentences);
          setGridRows(evt.grid);
          setColNumToName(evt.col_num_to_name)}
      }
      apiUrl={apiUrl}/>

      <RegenerateButton className="RegenerateButton" onClick={(evt) => {
          console.log(evt);
          setCorpus(evt.clicked_sentences);
          setGridRows(evt.grid);
          setColNumToName(evt.col_num_to_name)}
      }
      apiUrl={apiUrl}/>

      </div>
      </div>

      <div style={{
        display: "flex",
        flexDirection: "column"
      }}>

      <div style={{
        display: "flex",
        flexDirection: "row"
      }}>

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

      <Corpus sentences={corpus} />
      </div>
      </div>


    
          </DndProvider>
  );
}

export default App;
