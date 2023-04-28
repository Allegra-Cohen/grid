import Backend from "./Backend";
import Callback from "./Callback";
import Beliefs from "./Beliefs";
import Context from "./Context";
import CopyButton from  "./CopyButton";
import Corpus from "./Corpus";
import Grid from  "./Grid";
import InputBox from "./InputBox";
import KButton from "./KButton";
import RegenerateButton from  "./RegenerateButton";
import noMetadata from "./Metadata";

import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {Link} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";

import "./App.css";
import "./CopyButton.css";
import "./InputBox.css";
import "./KButton.css";
import "./Page.css";
import "./RegenerateButton.css";
import "./Spinner.css";

export default function App({apiurl}) {
    const [filename, setFilename] = useState();
    const [anchor, setAnchor] = useState();
    const [corpus, setCorpus] = useState([]);
    const [metadata, setMetadata] = useState(noMetadata);
    const [gridRows, setGridRows] = useState({});
    const [colNumToName, setColNumToName] = useState({});
    const [frozenColumns, setFrozenColumns] = useState([]);
    const [rowContents, setRowContents] = useState({});
    const [waiting, setWaiting] = useState(false);
    const [saveAs, setSaveAs] = useState();
    const [beliefsAvailable, setBeliefsAvailable] = useState(false);

    const backend = useMemo(() => new Backend(apiurl, setWaiting), [apiurl]);

    useEffect(() => {
        const request = backend.toRequest("data")
        backend.fetchThen(request, response => {
            const {data, beliefsAvailable} = response;
            setFilename(data.filename);
            setAnchor(data.anchor);
            setCorpus(data.clicked_sentences);
            setGridRows(data.grid);
            setColNumToName(data.col_num_to_name);
            setFrozenColumns(data.frozen_columns);
            setRowContents(data.row_contents);
            setBeliefsAvailable(beliefsAvailable);
        });
    }, [backend]);

    const handleSaveTyping = new Callback("App.handleSaveTyping").get(evt => {
        setSaveAs(evt.target.value);
    });

    const handleSaveAs = new Callback("App.handleSaveAs").get(saveAs => {
        const request = backend.toRequest("saveAsGrid", ["text", saveAs]);
        backend.fetchThen(request, response => {
            setFilename(response.filename);
        });
    });

    const handleSaveClick = new Callback("App.handleSaveClick").get(() => {
        if (saveAs) {
            const request = backend.toRequest("showGrids");
            backend.fetchThen(request, response => {
                if (response.grids.includes(saveAs)) {
                    const safe = window.confirm("A Grid with this name already exists. Would you like to overwrite?");
                    if (safe)
                        handleSaveAs(saveAs);
                }
                else
                    handleSaveAs(saveAs);
            });
        }
        else {
            const request = backend.toRequest("saveGrid");
            backend.fetch(request);
        }
    });

    const handleGridChange = new Callback("App.handleGridDrop").get(evt => {
        setCorpus(evt);
        setMetadata(noMetadata)
    });

    const handleGridDrop = new Callback("App.handleGridDrop").get(evt => {
        console.log("evt:", evt);
        console.log("drop!");
        setCorpus(evt.clicked_sentences);
        setGridRows(evt.grid);
        setColNumToName(evt.col_num_to_name);
        setMetadata(noMetadata)
    });

    const handleGridFooter = new Callback("App.handleGridFooter").get(evt => {
        setGridRows({...evt.grid});
        setColNumToName({...evt.col_num_to_name});
        setFrozenColumns([...evt.frozen_columns]);
    });

    const handleGridDelete = new Callback("App.handleGridDelete").get(evt => {
        setCorpus(evt.clicked_sentences);
        setGridRows({...evt.grid});
        setColNumToName({...evt.col_num_to_name});
        setFrozenColumns([...evt.frozen_columns]); // TODO convert this to other format?
    });

    const handleRegenerate = new Callback("App.handleRegenerate").get(evt => {
        console.log("evt:", evt);
        setCorpus(evt.clicked_sentences);
        setGridRows(evt.grid);
        setColNumToName(evt.col_num_to_name);
        setFrozenColumns(evt.frozen_columns);
    });

    const handleNewColumn = new Callback("App.handleNewColumn").get(evt => {
        console.log("evt:", evt);
        setCorpus(evt.clicked_sentences);
        setGridRows(evt.grid);
        setColNumToName(evt.col_num_to_name);
        setFrozenColumns(evt.frozen_columns);
    });

    const handleCorpusChange = new Callback("App.handleCorpusChange").get(evt => {
        setMetadata(evt)
    });

    const anchorDiv = (waiting ? 
        <div/>
        :
        <div style={{display:"inline", width: "80px", marginBottom:"0.03em", marginLeft:"4em", marginTop:"3%", fontFamily:"InaiMathi", fontSize:"20pt"}}>
            {filename} ({anchor})
        </div>
    );

    const spinnerDiv = (waiting ?
        <div className="spinner" style={{marginLeft:"25%",marginTop:"3%"}}/>
        : 
        <div/>
    );

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="banner">
                <Link to="/">Back&nbsp;to&nbsp;Gallery</Link>
                <div style={{marginLeft:"80%"}}>
                    <input style={{width:"80%", height:"2em", color:"black", fontSize: "13pt", border: "1.5px solid #90c5e1"}} placeholder="Save as" onKeyUp={handleSaveTyping} apiurl={apiurl}/>
                </div>
                <button style={{marginLeft:"2%", fontSize:"20pt", background:"none", borderWidth:"1pt"}} onClick={handleSaveClick}>&#x1F4BE;</button>
            </div>
            {anchorDiv}
            <div className="App">
                <div className="flexColumn">
                    {spinnerDiv}
                    <Grid
                        data={gridRows}
                        col_num_to_name={colNumToName}
                        frozen_columns={frozenColumns}
                        row_contents = {rowContents}
                        onChange={handleGridChange}
                        onDrop={handleGridDrop}
                        onFooter={handleGridFooter}
                        onDeleteFrozen={handleGridDelete}
                        apiurl={apiurl}
                    />
                    <div className="flexColumn">
                        <div className="flexRow">
                            <InputBox data={gridRows} col_num_to_name={colNumToName} onKeyPress={handleNewColumn} apiurl={apiurl} />
                            <CopyButton className="CopyButton" apiurl={apiurl} />
                        </div>
                        <div className="flexRow">
                            <RegenerateButton className="RegenerateButton" onClick={handleRegenerate} apiurl={apiurl} />
                            <KButton className="KButton" apiurl={apiurl} />
                        </div>
                    </div>
                </div>
                <div className="flexColumn">
                    <div className="flexRow" style={{fontFamily: "InaiMathi"}}>
                        <Corpus sentences={corpus} onChange={handleCorpusChange} apiurl={apiurl} />
                        <Context context={metadata.context} />
                        <Beliefs beliefs={metadata.beliefs} beliefsAvailable={beliefsAvailable} />
                    </div>
                </div>
            </div>
        </DndProvider>
    );
}
