import Beliefs from './Beliefs';
import Context from './Context';
import CopyButton from  "./CopyButton"
import Corpus from './Corpus.js'
import Grid from  "./Grid"
import InputBox from './InputBox'
import KButton from './KButton'
import RegenerateButton from  "./RegenerateButton"
import noMetadata from './Metadata.js';
import {toRequest} from "./toEncoding";

import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Link} from "react-router-dom";
import {useEffect, useState} from "react";

import './App.css';
import './CopyButton.css'
import './InputBox.css'
import './KButton.css'
import './LoadBox.css'
import './RegenerateButton.css'
import './Spinner.css';

// This is the real application. "App" is currently a modified version to allow people with small screens to read the text.

function App({apiurl}) {
    const [filename, setFilename] = useState();
    const [anchor, setAnchor] = useState();
    const [corpus, setCorpus] = useState([]);
    const [metadata, setMetadata] = useState(noMetadata);
    const [gridRows, setGridRows] = useState({})
    const [colNumToName, setColNumToName] = useState({})
    const [frozenColumns, setFrozenColumns] = useState([])
    const [rowContents, setRowContents] = useState({})
    const [waiting, setWaiting] = useState(false)
    const [saveAs, setSaveAs] = useState()
    const [beliefsAvailable, setBeliefsAvailable] = useState(false);

    useEffect(() => {
        setWaiting(true)
        fetch(`${apiurl}/data/`)
            .then(response => response.json())
            .then(response => {
                const {data, beliefsAvailable} = response
                setFilename(data.filename);
                setAnchor(data.anchor);
                setCorpus(data.clicked_sentences);
                setGridRows(data.grid);
                setColNumToName(data.col_num_to_name);
                setFrozenColumns(data.frozen_columns);
                setRowContents(data.row_contents);
                setBeliefsAvailable(beliefsAvailable);
                setWaiting(false);
            });
    }, [apiurl])

    const handleSaveTyping = (evt) => {
        setSaveAs(evt.target.value);
    }

    const handleSaveAs = (saveAs) => {
        let request = toRequest(apiurl, "saveAsGrid", [["text", saveAs]]);
        fetch(request)
            .then(response => response.json())
            .then(data => setFilename(data.filename));
    }

    const handleSaveClick = () => {
        if (saveAs) {
            fetch(`${apiurl}/showGrids/`)
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
            fetch(`${apiurl}/saveGrid/`)
        }
    }


    return (
        <DndProvider backend={HTML5Backend}>
            <div style={{background: "#a9d3ff", padding:"1%", display: 'flex', flexDirection: 'row', marginBottom:'1%'}}>
                <Link style={{color:'black', marginTop:'0.5%'}} to="/">Back to Gallery</Link>
                <div style={{marginLeft:'80%'}}><input style={{width:'90%', height:"2em", color:'black', fontSize: '13pt', border: '1.5px solid #90c5e1'}} placeholder='Save as' onKeyUp={(evt) => handleSaveTyping(evt)} apiurl={apiurl}/></div>
                <button style={{marginLeft:'2%', fontSize:'20pt', background:'none', borderWidth:'1pt'}} onClick={(evt)=>handleSaveClick()}>💾</button>
            </div>

            {waiting ? 
                <div/>
                :
                <div style={{display:'inline', width: '80px', marginBottom:'0.03em', marginLeft:'4em', marginTop:'3%', fontFamily:'InaiMathi', fontSize:'20pt'}}> {filename} ({anchor}) </div>
            }

            <div className="App" style={{display: "flex", flexDirection: "row"}}>
                <div style={{display: "flex", flexDirection: "column"}}>
        
                    {waiting ? 
                        <div className='spinner' style={{marginLeft:'25%',marginTop:'3%'}}/>
                        : 
                        <div/>
                    }

                    <Grid data={gridRows} col_num_to_name={colNumToName} frozen_columns={frozenColumns} row_contents = {rowContents}
                        onChange={
                            (evt) => {
                                setCorpus(evt);
                                setMetadata(noMetadata)
                            }
                        }
                        onDrop={
                            (evt) => {
                                console.log("evt:", evt);
                                console.log('drop!');
                                setCorpus(evt.clicked_sentences);
                                setGridRows(evt.grid);
                                setColNumToName(evt.col_num_to_name);
                                setMetadata(noMetadata)
                            }
                        }
                        onFooter={
                            (evt) => {
                                console.log('onfooter evt:', evt);
                                setGridRows({...evt.grid});
                                setColNumToName({...evt.col_num_to_name});
                                setFrozenColumns([...evt.frozen_columns]);
                            }
                        }
                        onDeleteFrozen={
                            (evt) => {
                                console.log('delete frozen evt:', evt);
                                setCorpus(evt.clicked_sentences);
                                setGridRows({...evt.grid});
                                setColNumToName({...evt.col_num_to_name});
                                setFrozenColumns([...evt.frozen_columns]);
                            }
                        }
                        apiurl={apiurl}
                    />
                    <div style={{display:"flex", flexDirection:"column"}}>
                        <div style={{display:"flex", flexDirection:"row"}}>
                            <InputBox data={gridRows} col_num_to_name={colNumToName} 
                                onKeyPress={
                                    (evt) => {
                                        console.log("evt:", evt);
                                        setCorpus(evt.clicked_sentences);
                                        setGridRows(evt.grid);
                                        setColNumToName(evt.col_num_to_name);
                                        setFrozenColumns(evt.frozen_columns)
                                    }
                                }
                                apiurl={apiurl}
                            />
                            <CopyButton className="CopyButton"
                                onClick={
                                    (evt) => {
                                        console.log("copy button evt:", evt)
                                    }
                                }
                                apiurl={apiurl}
                            />
                        </div>
                        <div style={{display:"flex", flexDirection:"row"}}>
                            <RegenerateButton className="RegenerateButton"
                                onClick={(evt) => {
                                    console.log("evt:", evt);
                                    setCorpus(evt.clicked_sentences);
                                    setGridRows(evt.grid);
                                    setColNumToName(evt.col_num_to_name);
                                    setFrozenColumns(evt.frozen_columns)}
                                }
                                apiurl={apiurl}
                            />
                            <KButton className="KButton" apiurl={apiurl}/>
                        </div>
                    </div>
                </div>

                <div style={{display: "flex", flexDirection: "column"}}>
                    <div style={{display: "flex", flexDirection: "row", fontFamily: 'InaiMathi'}}>
                        <Corpus sentences={corpus}
                            onChange={
                                (evt) => {
                                    console.log("evt:", evt);
                                    console.log('sentence click!');
                                    setMetadata(evt)
                                }
                            }
                            apiurl={apiurl}
                        />
                        <Context context={metadata.context}/>
                        <Beliefs beliefsAvailable={beliefsAvailable} beliefs={metadata.beliefs}/>
                    </div>
                </div>
            </div>
        </DndProvider>
    );
}

export default App;
