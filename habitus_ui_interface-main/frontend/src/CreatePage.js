import Backend from "./Backend";
import Callback from "./Callback";

import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {Link} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";

import "./info.css";
import "./Page.css";
import "./Spinner.css";

export default function CreatePage({apiurl}) {
    const [grids, setGrids] = useState([]);
    const [filepath, setFilepath] = useState([]);
    const [filename, setFilename] = useState([]);
    const [anchor, setAnchor] = useState([]);
    const [rowFilename, setRowFilename] = useState([]);
    const [supercorpus, setSupercorpus] = useState([]);
    const [validFile, setValidFile] = useState([]);
    const [error, setError] = useState(false);
    const [waiting, setWaiting] = useState(false);

    const backend = useMemo(() => new Backend(apiurl, setWaiting), [apiurl]);

    useEffect(() => {
        const request = backend.toRequest("showGrids");
        backend.fetchThen(request, response => {
            setGrids(response.grids);
            setFilepath(response.filepath);
        });
    }, [backend]);

    const navigate = useNavigate();

    const handleInput = new Callback("CreatePage.handleInput").get((variable, evt) => {
        const text =  evt.target.value;
        if (variable === "filename") {
            if (grids.includes(text))
                setValidFile(false);
            else {
                setFilename(text);
                setValidFile(true);
            }
        }
        else if (variable === "anchor")
            setAnchor(text);
        else if (variable === "rowname")
            setRowFilename(text);
        else
            setSupercorpus(text);
    });

    const handleButton = new Callback("CreatePage.handleButton").get(env => {
        if (validFile && rowFilename.length > 0) {
            setError(false);
            const text = anchor.length > 0 ? anchor : "load_all";
            const request = backend.toRequest("loadNewGrid",
                ["corpusFilename", supercorpus], ["rowFilename", rowFilename], ["newFilename", filename], ["newAnchor", text]
            );
            backend.fetchThen(request, response => {
                if (!response)
                    setError(true);
                else
                    navigate("/grid");
            });
        }
    });

    const handleCorpus = new Callback("CreatePage.handleCorpus").get(evt => {
        handleInput("corpus", evt);
    });

    const handleRowname = new Callback("CreatePage.handleRowname").get(evt => {
        handleInput("rowname", evt);
    });

    const handleAnchor = new Callback("CreatePage.handleAnchor").get(evt => {
        handleInput("anchor", evt);
    });

    const handleFilename = new Callback("CreatePage.handleFilename").get(evt => {
        handleInput("filename", evt);
    });

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="banner">
                <Link to="/">Back to Gallery</Link>
            </div>
            <div style={{marginTop:"5%"}}>
                <h1 style={{marginLeft:"40%"}}>Create a new Grid</h1>
                <div className="flexRow">
                    <div className="info" style={{width:"max-content", marginLeft:"37%"}} onKeyUp={handleCorpus}>
                        Which corpus will you use?
                        <input placeholder = "Corpus filename"/>
                    </div>
                    {supercorpus.length === 0 && !error ?
                        <div style={{margin: "0.5%", padding: "1%", color: "blue"}}>
                            Please provide a filename
                        </div>
                        :
                        <div/>
                    }
                </div>
                <div className="flexRow">
                    <div className="info" style={{width:"max-content", marginLeft:"36.6%"}} onKeyUp={handleRowname}>
                        Which row labels will you use?
                        <input placeholder = "Row labels filename"/>
                    </div>
                    {rowFilename.length === 0 && !error ? 
                        <div style={{margin: "0.5%", padding: "1%", color: "blue"}}>
                            Please provide a filename
                        </div>
                        :
                        <div/>
                    }
                </div>
                <div className="info" style={{width:"max-content", marginLeft:"36%"}} onKeyUp={handleAnchor}>
                    Do you want to anchor your Grid?
                    <input placeholder = "Anchor term"/>
                </div>
                <div className="flexRow">
                    <div className="info" style={{width:"max-content", marginLeft:"33%"}} onKeyUp={handleFilename}>
                        What filename do you want to save your Grid with?
                        <input placeholder = "Filename"/>
                    </div>
                    {validFile ?
                        <div/>
                        :
                        <div style={{margin: "0.5%", padding: "1%", color: "red"}}>That filename already exists</div>
                    }
                    {filename.length > 0 ? 
                        <div/>
                        :
                        <div style={{margin: "0.5%", padding: "1%", color: "blue"}}>Please provide a filename</div>
                    }
                </div>
            </div>
            <button style={{width:"max-content", marginLeft:"44%", fontSize:"14pt", padding:"0.5%", backgroundColor:"#54f07d"}} onClick={handleButton}>Ready!</button>
            <div>
                {error ? 
                    <div style={{marginLeft: "26%", margin: "0.5%", padding: "1%", color: "red"}}>
                        Please double check your corpus and row label files. One or more of them does not exist in the folder {filepath}
                    </div>
                    :
                    <div/>
                }
                {waiting ? 
                    <div>
                        <div style={{marginLeft:"34%", marginTop:"2%", marginBottom:"1%"}}>
                            Loading corpus...If this is a new corpus, this step may take several minutes.
                        </div>
                        <div className="spinner" style={{marginLeft:"44%"}}>
                        </div>
                    </div>
                    :
                    <div/>
                }
            </div>
        </DndProvider>
    );
}
