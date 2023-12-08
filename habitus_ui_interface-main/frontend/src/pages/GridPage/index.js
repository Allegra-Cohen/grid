
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton, Header, Button, Input, Loading, Modal, Grid } from 'components';
import { fetchDataFromApi, toQuery } from "services"
import './styles.css';

function GridPage() {
    const [filename, setFilename] = useState('');
    const [anchor, setAnchor] = useState('');
    const [waitingFileName, setWaitingFilename] = useState(false)
    const [saveAs, setSaveAs] = useState('')
    const [openModalSave, setOpenModalSave] = useState(false)
    const [openModalDelete, setOpenModalDelete] = useState(false)

    const navigate = useNavigate();

    useEffect(() => {
        setWaitingFilename(true)
        fetchDataFromApi('/data/')
            .then(data => {
                setFilename(data.filename);
                setAnchor(data.anchor);
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
                navigate('/gallery');
            });
    }

    const handleSaveClick = () => {
        if (saveAs) {
            fetchDataFromApi(`/showGrids/`)
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

    return (
        <div>
            <>
                <Header>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                    onConfirm={() => {
                        handleDeleteClick()
                        setOpenModalDelete(false)
                    }}
                    open={openModalDelete}
                    onClose={() => setOpenModalDelete(false)}
                />
                <Modal
                    title="A Grid with this name already exists."
                    description="Would you like to overwrite ?"
                    onConfirm={() => {
                        handleSaveAs(saveAs)
                        setOpenModalSave(false)
                    }}
                    open={openModalSave}
                    onClose={() => setOpenModalSave(false)}
                />
            </>
            <Grid />
        </div >
    );
}

export default GridPage;
