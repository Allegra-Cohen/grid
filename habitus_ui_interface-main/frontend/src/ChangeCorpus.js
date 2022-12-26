import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {useId, useEffect, useState} from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import {toHex} from "./toHex"
import './info.css';
import './Spinner.css';


export default function ChangeCorpus({apiUrl}) {

	const [filepath, setFilepath] = useState([]);
	const [error, setError] = useState();
	const [errorPath, setErrorPath] = useState([]);
	const [waiting, setWaiting] = useState(false);
	const [corpusFile, setCorpusFile] = useState([]);
	const [rowsFile, setRowsFile] = useState([]);

	const handleInput = (text) => {
		setFilepath(text)
	}

    const handleButton = () => {
    	if (filepath.length > 0){
			setWaiting(true);
			console.log('eee')
			fetch(`${apiUrl}/processSupercorpus/${toHex(filepath)}/`)
				.then(response => response.json())
	            .then(data => {
	            	setWaiting(false);
	            	setError(!data.success);
	            	if (data.success){
	            		setCorpusFile(data.corpus_file);
	            		setRowsFile(data.rows_file)
	            	} else {
	            		setErrorPath(filepath);
	            	}
	            });
    	}
    }

	return (
      <DndProvider backend={HTML5Backend}>
      <div style={{background: "#a9d3ff", padding:"1%"}}><Link style={{color:'black'}} to="/">Back to Gallery</Link></div>
      <div style={{marginTop:'5%'}}>
      <div style={{display: "flex", flexDirection: "row", justifyContent:'center'}}>
      <div className='info' style={{width:'max-content', fontSize:'14pt', }} onKeyUp={(evt) => handleInput(evt.target.value)}>
      Please enter the filepath to the folder that contains corpus documents: <br/><br/> <input placeholder = "Corpus filename" style={{width:'100%',  fontSize:'14pt'}}/>
      </div>
      {filepath.length > 0 ? <div/> : <div style={{margin: '0.5%', padding: '1%', color: 'blue'}}>Please provide a path</div>}
      </div>
      </div>
      <div style={{textAlign:'center'}}><button style={{width:'max-content',fontSize:'14pt', padding:'0.5%', backgroundColor:'#54f07d'}} onClick={(evt)=>handleButton()}>Ready!</button></div>
      <div>
      {error ? <div style={{textAlign:'center', padding: '1%', color: 'red'}}>Cannot locate {errorPath}.</div> : <div/> }
      {error === false ? <div style={{marginLeft: '-8%', margin: '0.5%', padding: '1%', textAlign:'center'}}>All done! Your corpus is now ready to be used. <br/>The corpus name is <b>{corpusFile}</b> and its associated default row labels are stored in <b>{rowsFile}</b>.</div> : <div/> }
      {waiting ? <div><div style={{textAlign: 'center', marginTop:'2%', marginBottom:'1%'}}>Preparing corpus...If this is a new corpus, this step can take a long time.</div><div className='spinner'></div></div>: <div/>}
      </div>
      </DndProvider>
  );
}