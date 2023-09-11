import './App.css';
import Corpus from './Corpus.js'
import Grid from "./Grid"
import RegenerateButton from "./RegenerateButton"
import CopyButton from "./CopyButton"
import './CopyButton.css'
import './RegenerateButton.css'
import InputBox from './InputBox'
import './InputBox.css'
import LoadBox from './LoadBox'
import './LoadBox.css'
import KButton from './KButton'
import './KButton.css'
import SynonymBook from './SynonymBook'
import Trash from './Trash'
import { useEffect, useState } from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Link } from "react-router-dom";
import './Spinner.css';
import './index.css';
import { toQuery } from "./toEncoding";
import { BackButton, Header, Button, Input, Loading } from './components';
import { Icon } from '@iconify/react';

// This is the real application. "App" is currently a modified version to allow people with small screens to read the text.

function App({ apiurl }) {
    const [filename, setFilename] = useState();
    const [anchor, setAnchor] = useState();
    const [corpus, setCorpus] = useState([]);
    const [context, setContext] = useState([]);
    const [gridRows, setGridRows] = useState({})
    const [colNumToName, setColNumToName] = useState({})
    const [frozenColumns, setFrozenColumns] = useState([])
    const [rowContents, setRowContents] = useState({})
    const [waiting, setWaiting] = useState(false)
    const [saveAs, setSaveAs] = useState()

    useEffect(() => {
        setWaiting(true)
        fetch(`${apiurl}/data/`)
            .then(response => response.json())
            .then(data => {
                setFilename(data.filename);
                setAnchor(data.anchor);
                setCorpus(data.clicked_sentences);
                setGridRows(data.grid);
                setColNumToName(data.col_num_to_name);
                setFrozenColumns(data.frozen_columns);
                setRowContents(data.row_contents);
                setWaiting(false);
            });
    }, [])

    const handleSaveTyping = (evt) => {
        setSaveAs(evt.target.value);
    }

    const handleSaveAs = (saveAs) => {
        let query = toQuery([["text", saveAs]]);
        fetch(`${apiurl}/saveAsGrid/${query}`)
            .then(response => response.json())
            .then(data => {
                setFilename(data.filename);
            });
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
            <Header>
                <div className="leftContent">
                    <BackButton screenName={filename + ` (${anchor})`} />
                </div>

                <div className="rightContent">
                    <Input placeholder="Save as..." icon="fluent:save-24-regular" />
                    <Button label="Delete Grid" color="red" icon="octicon:trash-16" marginLeft />
                </div>
            </Header>

            {waiting ? <Loading /> :

                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px', borderBottom: corpus.length > 0 ? '1px solid #DDDDDD' : 'none' }}>
                    <Grid data={gridRows} col_num_to_name={colNumToName} frozen_columns={frozenColumns} row_contents={rowContents} onChange={
                        (evt) => {
                            setCorpus(evt);
                            setContext('')
                        }
                    }
                        onDrop={
                            (evt) => {
                                console.log(evt);
                                console.log('drop!');
                                setCorpus(evt.clicked_sentences);
                                setGridRows(evt.grid);
                                setColNumToName(evt.col_num_to_name);
                                setContext('')
                            }
                        }
                        onFooter={
                            (evt) => {
                                console.log('onfooter:', evt);
                                setGridRows({ ...evt.grid });
                                setColNumToName({ ...evt.col_num_to_name });
                                setFrozenColumns([...evt.frozen_columns]);
                            }
                        }

                        onDeleteFrozen={
                            (evt) => {
                                console.log('delete frozen:', evt);
                                setCorpus(evt.clicked_sentences);
                                setGridRows({ ...evt.grid });
                                setColNumToName({ ...evt.col_num_to_name });
                                setFrozenColumns([...evt.frozen_columns]);
                            }
                        }
                        apiurl={apiurl} />

                    <div style={{ gap: 5, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', maxWidth: '220px' }}>
                        <Input placeholder="Create new column..." />

                        <Input placeholder="Max. Columns..." />
                        <Button label="Update Grid" color="green" icon="ci:arrow-reload-02" onClick={() => {
                            fetch(`${apiurl}/regenerate/`)
                                .then(response => response.json())
                                .then(response => {
                                    console.log(response);
                                    setCorpus(response.clicked_sentences);
                                    setGridRows(response.grid);
                                    setColNumToName(response.col_num_to_name);
                                    setFrozenColumns(response.frozen_columns)
                                });



                        }} />
                        <Button label="Copy" color="blue" icon="lucide:copy" />

                      
                    </div>


                </div>
            }

            {corpus.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px' }}>
                    <div style={{ width: '48%' }}>
                        <h2 style={{
                            textAlign: 'center', margin: 'auto', fontWeight: 600,
                            color: '#2c2c2c'
                        }}>Sentences</h2>
                        <Corpus sentences={corpus}
                            onChange={(evt) => {
                                console.log(evt);
                                console.log('sentence click!');
                                setContext(evt)
                            }}
                            apiurl={apiurl} />
                    </div>

                    {context.length > 0 && (
                        <>
                            <div style={{ top: '0', bottom: '0', left: '50%', width: '1px', backgroundColor: '#ccc' }}></div>
                            <div style={{ width: '48%' }}>
                                <h2 style={{
                                    textAlign: 'center', margin: 'auto', fontWeight: 600,
                                    color: '#2c2c2c'
                                }}>Context</h2>
                                <div className='contextCard'>
                                    {context[0]} <b>{context[1]}</b> {context[2]}
                                </div>
                            </div>
                        </>

                    )}
                </div>
            )}
        </DndProvider >
    );
}

export default App;
