import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {useId, useEffect, useState} from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import './info.css';


function CreatePage({apiUrl}) {

	const [grids, setGrids] = useState([]);
	const [filename, setFilename] = useState([]);
	const [anchor, setAnchor] = useState([]);
	const [supercorpus, setSupercorpus] = useState([]);
	const [validFile, setValidFile] = useState([]);
	const [corpusExists, setCorpusExists] = useState([]);
	const [error, setError] = useState([]);

	useEffect(() => {
        fetch(`${apiUrl}/showGrids/`)
            .then( response => response.json())
            .then( data => {
                setGrids(data.grids);
            });
    }, [])

	const handleInput = (variable, text) => {
		if (variable === 'filename'){
			if (grids.includes(text)) {
				setValidFile(false)
			} else {
				setFilename(text)
				setValidFile(true)
			}
		} else if (variable === 'anchor'){
			setAnchor(text)
		} else {
			setSupercorpus(text)
			setCorpusExists(true); /* Need something here to actually check that the file exists, AND to load the new vectors if needed */
		}
    }

    const handleButton = () => {
    	let text = 'None'
    	if (validFile & corpusExists){
    		if (anchor.length > 0) {
    			text = anchor
    		}
    		console.log(text)
	    	fetch(`${apiUrl}/loadNewGrid/${supercorpus}/${filename}/${text}/`)
	            .then(response => {response.json();
	            	/* Now, if it's an error, need to show the right text; otherwise, need to follow link to new Grid */
	            		setError(response)});
    	}
    }

	return (
      <DndProvider backend={HTML5Backend}>
      <div style={{marginTop:'5%'}}>
      <h1 style={{marginLeft:'40%'}}>Create a new Grid</h1>
      <div style={{display: "flex", flexDirection: "row"}}>
      <div className='info' style={{width:'max-content', marginLeft:'37%'}} onKeyUp={(evt) => handleInput('corpus', evt.target.value)}>Which corpus will you use? <input placeholder = "Corpus filename"/></div>
      {corpusExists ? <div/> : <div style={{margin: '0.5%', padding: '1%', color: 'red'}}>Please enter a valid filename</div>}
      </div>
      <div className='info' style={{width:'max-content', marginLeft:'36%'}} onKeyUp={(evt) => handleInput('anchor', evt.target.value)}>Do you want to anchor your Grid? <input placeholder = "Anchor term"/></div>
      <div style={{display: "flex", flexDirection: "row"}}>
      <div className='info' style={{width:'max-content', marginLeft:'33%'}} onKeyUp={(evt) => handleInput('filename', evt.target.value)}>What filename do you want to save your Grid with? <input placeholder = "Filename"/></div>
      {validFile ? <div/> : <div style={{margin: '0.5%', padding: '1%', color: 'red'}}>That filename already exists</div>}
      </div>
      </div>
      <button style={{width:'max-content', marginLeft:'44%', fontSize:'14pt', padding:'0.5%', backgroundColor:'#54f07d'}} onClick={(evt)=>handleButton()}>Ready!</button>
      </DndProvider>
  );
}

export default CreatePage;