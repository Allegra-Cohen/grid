import './App.css';
import Corpus from './Corpus.js'
import Grid from "./Grid"
import CopyButton from "./CopyButton"
import './CopyButton.css'
import InputBox from './InputBox'
import './InputBox.css'
import { useEffect, useState } from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Link, useNavigate } from "react-router-dom";
import './Spinner.css';
import './index.css';
import { toQuery } from "./toEncoding";
import { BackButton, Header, Button, Input, Loading, Modal } from './components';
import { fetchDataFromApi } from "./services"
import './Corpus.css'
import Countdown from 'react-countdown';
import { Icon } from '@iconify/react';

// This is the real application. "App" is currently a modified version to allow people with small screens to read the text.

function App({ training, edit, timeLimit }) {
    const [flag, setFlag] = useState();

    const [filename, setFilename] = useState();
    const [anchor, setAnchor] = useState();
    const [corpus, setCorpus] = useState([]);
    const [context, setContext] = useState([]);
    const [gridRows, setGridRows] = useState({})
    const [colNumToName, setColNumToName] = useState({})
    const [frozenColumns, setFrozenColumns] = useState([])
    const [rowContents, setRowContents] = useState({})
    const [waiting, setWaiting] = useState(false)
    const [waitingFileName, setWaitingFilename] = useState(false)
    const [saveAs, setSaveAs] = useState('')
    const [openModalSave, setOpenModalSave] = useState(false)
    const [openModalDelete, setOpenModalDelete] = useState(false)
    const [disabled, setDisabled] = useState(false);
    const [start, setStart] = useState(Date.now());


    const navigate = useNavigate();

    function makeMeTwoDigits(n) {
        return (n < 10 ? "0" : "") + n;
    }
    useEffect(() => {
        setWaiting(true)
        setWaitingFilename(true)
        fetchDataFromApi('/data/')
            .then(data => {
                setFilename(data.filename);
                setAnchor(data.anchor);
                setCorpus(data.clicked_sentences);
                setGridRows(data.grid);
                setColNumToName(data.col_num_to_name);
                setFrozenColumns(data.frozen_columns);
                setRowContents(data.row_contents);
                setWaiting(false);
                setWaitingFilename(false);
            });
    }, [])

    const handleSaveTyping = (evt) => {
        setSaveAs(evt.target.value);
    }

    const handleSaveAs = (saveAs) => {
        let query = toQuery([["text", saveAs]]);
        fetchDataFromApi(`/saveAsGrid/${query}`)
            .then(data => {
                setFilename(data.filename);
            });
    }

    const handleDeleteClick = () => {
        let query = toQuery([["text", filename]]);
        fetchDataFromApi(`/deleteGrid/${query}`)
            .then(data => {
                console.log(data);
                navigate('/');
            });
    }


    const handleSaveClick = () => {
        console.log('handleSaveClick')
        if (saveAs) {
            fetchDataFromApi(`/showGrids/`)
                .then(response => response.json())
                .then(data => {
                    if (data.grids.includes(saveAs)) {
                        setOpenModalSave(true)
                    } else {
                        handleSaveAs(saveAs)
                    }
                })
        } else {
            fetchDataFromApi(`/saveGrid/`)
        }
    }

    const timer = ({ hours, minutes, seconds, completed }) => {
        if (completed || disabled) {
            setDisabled(true);
            return "Done!";
        } else {
            return <span>{makeMeTwoDigits(minutes)}:{makeMeTwoDigits(seconds)}</span>;
        }
    };

    const handleLinkClick = () => {
        navigate('/tutorial/instructions2')
        /*fetch(`${apiUrl}/saveGrid/${anchor}/${userID}`).then(response => response.json());*/
    }


    return (
        <DndProvider backend={HTML5Backend}>
            {!training && !edit && (
                <>
                    <Header>
                        <div className="leftContent">
                            {waitingFileName ? <Loading /> : <BackButton screenName={filename + ` (${anchor})`} />}
                        </div>

                        <div className="rightContent">
                            <Input
                                placeholder="Save as..."
                                onInput={(evt) => handleSaveTyping(evt)}
                            />
                            <Button color="green" icon="teenyicons:save-outline" onClick={() => handleSaveClick()} noGap />
                            <Button color="red" icon="octicon:trash-16" onClick={() => setOpenModalDelete(true)} noGap />
                        </div>
                    </Header>
                    <Modal
                        title="Delete Grid?"
                        description="This cannot be undone."
                        onSave={() => {
                            handleDeleteClick()
                            setOpenModalDelete(false)
                        }}
                        open={openModalDelete}
                        onClose={() => setOpenModalDelete(false)}
                    />
                    <Modal
                        title="A Grid with this name already exists."
                        description="Would you like to overwrite ?"
                        onSave={() => {
                            handleSaveAs()
                            setOpenModalSave(false)
                        }}
                        open={openModalSave}
                        onClose={() => setOpenModalSave(false)}
                    />
                </>
            )}

            {edit === true && training === false && (
                <>
                    <div style={{ padding: '2%' }}>
                        <div className='styledTrainingPage' >
                            <div className="title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                Cheat Sheet
                                <div className='floating-div'>
                                    <Icon icon="ci:timer" width="20" height="20" style={{ marginRight: 12, marginBottom: -4 }} />
                                    <Countdown date={start + timeLimit} renderer={timer} />
                                </div>
                                <Button label="Done? Move to the next page" color="blue" noGap onClick={() => handleLinkClick()} />

                            </div>
                            <div style={{ fontSize: '14px' }}>
                                {flag === 'control' ?
                                    <>
                                        <b> Creating new columns:</b> Type a word into the "Create New Column" box and press Enter to create a column with all sentences that include the word. <br />
                                        <b> Deleting columns:</b> Click the wastebasket beneath the column you want to delete. This will return the sentences in that column to the beginning column.  <br />
                                        <b> Renaming columns:</b> Type a new name below the column you want to rename and press Enter.  <br />
                                        <b> Moving sentences:</b> Drag sentences between columns. To copy a sentence to a new column, click the "Copy" button before dragging.  <br />
                                        <b> Update Grid:</b> Clicking this button will remove the contents of new columns from the beginning column.
                                    </>
                                    :
                                    <>
                                        <b> Creating new columns:</b> Type a word into the "Create New Column" box and press Enter to create a column with all sentences that include the word. This column is now frozen and will not change when the Grid is updated. <br />
                                        <b> Deleting columns:</b> Click the wastebasket beneath the column you want to delete. You must update the Grid to return the sentences in the deleted column to the Grid. <br />
                                        <b> Renaming columns:</b> Type a new name below the column you want to rename and press Enter. Renaming a column also freezes it. <br />
                                        <b> Moving sentences:</b> Drag sentences between columns to move them. To copy a sentence to a new column, click the "Copy" button before dragging. <br />
                                        <b> Seeding columns:</b> If you drag a sentence between unfrozen columns, the sentence will stay in its new column when the Grid is updated. <br />
                                        <b> Update Grid:</b> Clicking this button will ask the machine to reorganize the Grid. It will generate new columns from the sentences that you have not previously frozen or seeded.
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px', borderBottom: corpus && corpus.length > 0 ? '1px solid #DDDDDD' : 'none' }}>
                {waiting ? <Loading /> :
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
                    />
                }
                <div style={{ gap: 5, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', maxWidth: '220px' }}>

                    <InputBox
                        onKeyPress={(evt) => {
                            console.log(evt);
                            setCorpus(evt.clicked_sentences);
                            setGridRows(evt.grid);
                            setColNumToName(evt.col_num_to_name);
                            setFrozenColumns(evt.frozen_columns)
                        }
                        }
                    />



                    {!training && (
                        <Input placeholder="Max. Columns" onInput={
                            (evt) => {
                                let query = toQuery([["k", evt.target.value]]);
                                fetch(`$"."/setK/${query}`)
                                    .then(response => response.json())
                            }
                        } />
                    )}

                    <Button label="Update Grid" color="green" icon="ci:arrow-reload-02" onClick={() => {
                        setWaiting(true)
                        fetchDataFromApi(`/regenerate/`)
                            .then(response => {
                                setCorpus(response.clicked_sentences);
                                setGridRows(response.grid);
                                setColNumToName(response.col_num_to_name);
                                setFrozenColumns(response.frozen_columns);
                                setWaiting(false);
                            });
                    }} />

                    <CopyButton className="CopyButton" onClick={(evt) => {
                        console.log("copy button: ", evt)
                    }} />
                </div>


            </div>


            {corpus && corpus.length > 0 && (
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
                        />
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
