import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {useId, useEffect, useState} from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import {useNavigate} from 'react-router-dom';
import './info.css';
import './Spinner.css';


function CreatePage({apiUrl}) {

	const [grids, setGrids] = useState([]);
	const [filename, setFilename] = useState([]);
	const [anchor, setAnchor] = useState([]);
	const [supercorpus, setSupercorpus] = useState([]);
	const [validFile, setValidFile] = useState([]);
	const [error, setError] = useState(false);
	const [waiting, setWaiting] = useState(false);

	useEffect(() => {
        fetch(`${apiUrl}/showGrids/`)
            .then( response => response.json())
            .then( data => {
                setGrids(data.grids);
            });
    }, [])

	const navigate = useNavigate();

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
		}
    }

    const handleButton = () => {
    	let text = 'load_all'

    	if (validFile){
    		if (anchor.length > 0) {
    			text = anchor
    		}
    		setWaiting(true)
    		setError(false)
	    	fetch(`${apiUrl}/loadNewGrid/${supercorpus}/${filename}/${text}/`)
	            .then(response => response.json())
	            .then(data => {
	            	setWaiting(false);
	            	if (!data) {
	            		setError(true)
	            	} else {
	            		navigate('/grid')
	            	}
	            })
    	}
    }

	return (
      <DndProvider backend={HTML5Backend}>
      <div style={{background: "#a9d3ff", padding:"1%"}}><Link style={{color:'black'}} to="/">Back to Gallery</Link></div>
      <div style={{marginTop:'5%'}}>
      <h1 style={{marginLeft:'40%'}}>Create a new Grid</h1>
      <div style={{display: "flex", flexDirection: "row"}}>
      <div className='info' style={{width:'max-content', marginLeft:'37%'}} onKeyUp={(evt) => handleInput('corpus', evt.target.value)}>Which corpus will you use? <input placeholder = "Corpus filename"/></div>
      {error ? <div style={{margin: '0.5%', padding: '1%', color: 'red'}}>Please enter a valid filename</div> : <div/> }
      {supercorpus.length == 0 && !error ? <div style={{margin: '0.5%', padding: '1%', color: 'red'}}>Please provide a filename</div> : <div/>}
      </div>
      <div className='info' style={{width:'max-content', marginLeft:'36%'}} onKeyUp={(evt) => handleInput('anchor', evt.target.value)}>Do you want to anchor your Grid? <input placeholder = "Anchor term"/></div>
      <div style={{display: "flex", flexDirection: "row"}}>
      <div className='info' style={{width:'max-content', marginLeft:'33%'}} onKeyUp={(evt) => handleInput('filename', evt.target.value)}>What filename do you want to save your Grid with? <input placeholder = "Filename"/></div>
      {validFile ? <div/> : <div style={{margin: '0.5%', padding: '1%', color: 'red'}}>That filename already exists</div>}
      {filename.length > 0 ? <div/> : <div style={{margin: '0.5%', padding: '1%', color: 'red'}}>Please provide a filename</div>}
      </div>
      </div>
      <button style={{width:'max-content', marginLeft:'44%', fontSize:'14pt', padding:'0.5%', backgroundColor:'#54f07d'}} onClick={(evt)=>handleButton()}>Ready!</button>
      <div>
      {waiting ? <div><div style={{marginLeft:'34%', marginTop:'2%', marginBottom:'1%'}}>Loading corpus...If this is a new corpus, this step may take several minutes.</div><div className='spinner' style={{marginLeft:'44%'}}></div></div>: <div/>}
      </div>
      </DndProvider>
  );
}

export default CreatePage;