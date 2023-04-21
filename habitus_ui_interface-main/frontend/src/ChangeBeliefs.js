import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Link} from "react-router-dom";
import {toQuery} from "./toEncoding";
import {useState} from "react";

import './info.css';
import './Spinner.css';

export default function ChangeBeliefs({apiurl}) {
    const [filepath, setFilepath] = useState([]);
    const [waiting, setWaiting] = useState(false);
    const [feedback, setFeedback] = useState(false);
    const [error, setError] = useState(false);
    const [beliefsFile, setBeliefsFile] = useState([]);

    const handleInput = (text) => {
        setFeedback(false);
        setFilepath(text);
    }

    const handleButton = () => {
        if (filepath.length > 0){
            setWaiting(true);
            setFeedback(false);
            let query = toQuery([["beliefsFilepath", filepath]]);
            fetch(`${apiurl}/processBeliefs/${query}`)
                .then(response => response.json())
                .then(data => {
                    setWaiting(false);
                    setError(!data.success);
                    if (data.success){
                        setBeliefsFile(data.beliefs_file)
                        // Report back that beliefs are available
                    }
                    else {
                        setBeliefsFile([])
                    };
                    setFeedback(true);
                });
        }
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div style={{background: "#a9d3ff", padding:"1%"}}><Link style={{color:'black'}} to="/">Back to Gallery</Link></div>
            <div style={{marginTop:'5%'}}>
                <div style={{display: "flex", flexDirection: "row", justifyContent:'center'}}>
                    <div className='info' style={{width:'max-content', fontSize:'14pt', }} onKeyUp={(evt) => handleInput(evt.target.value)}>
                        Please specify the beliefs file: <br/><br/> <input placeholder = "Beliefs file" style={{width:'100%',  fontSize:'14pt'}}/>
                    </div>
                    {filepath.length > 0 ? <div/> : <div style={{margin: '0.5%', padding: '1%', color: 'blue'}}>Please provide a path</div>}
                </div>
            </div>
            <div style={{textAlign:'center'}}>
                <button style={{width:'max-content',fontSize:'14pt', padding:'0.5%', backgroundColor:'#54f07d'}}
                    onClick={
                        (evt)=>
                            handleButton()
                    }
                >
                    Ready!
                </button>
            </div>
            <div>
                {waiting ? 
                    <div>
                        <div style={{textAlign: 'center', marginTop:'2%', marginBottom:'1%'}}>
                            Preparing beliefs...  This step can take a long time.
                        </div>
                        <div className='spinner'></div>
                    </div>
                    :
                    feedback ?
                        error ?
                            <div style={{textAlign:'center', padding: '1%', color: 'red'}}>
                                Cannot process {filepath}.
                            </div>
                            :
                            <div style={{marginLeft: '-8%', margin: '0.5%', padding: '1%', textAlign:'center'}}>
                                All done! Your beliefs are ready to be used.<br/>
                                The beliefs file is <b>{beliefsFile}</b>.
                            </div>
                        :
                        <div/>
                }
            </div>
        </DndProvider>
    );
}
