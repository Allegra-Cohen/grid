import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useId, useEffect, useState } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import { toQuery } from "./toEncoding"
import './info.css';
import './Spinner.css';
import { BackButton, Button, Header } from './components';
import { Icon } from '@iconify/react';
import { fetchDataFromApi } from './services';


export default function ChangeCorpus() {

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
		if (filepath.length > 0) {
			setWaiting(true);
			console.log('eee');
			let query = toQuery([["supercorpusFilepath", filepath]]);
			fetchDataFromApi(`/processSupercorpus/${query}`)
				.then(data => {
					setWaiting(false);
					setError(!data.success);
					if (data.success) {
						setCorpusFile(data.corpus_file);
						setRowsFile(data.rows_file)
					} else {
						setErrorPath(filepath);
					}
				});
		}
	}

	function updateFileName() {
		console.log('updateFileName')
		const input = document.getElementById("file-upload");
		const fileNameContainer = document.getElementById("file-name");
		console.log(fileNameContainer, input)

		if (input.files.length > 0) {
			fileNameContainer.textContent = input.files[0].name;

		} else {
			fileNameContainer.textContent = "Nenhum arquivo selecionado";
		}
	}

	return (
		<DndProvider backend={HTML5Backend}>
			<Header>
				<div className="leftContent">
					<BackButton screenName="Upload or Update Corpus" />
				</div>
			</Header>

			<div style={{ marginBottom: 15 }}>

				<div style={{ display: 'flex', justifyContent: 'center', marginBottom: 5 }}>
					<div className='inputCreate'>
						<div style={{ color: '#707273', fontWeight: 500 }} >
							Please enter the file that contains corpus documents:
						</div>

						<div style={{ color: 'red', display: 'flex', justifyContent: 'flex-end', flex: 1 }}>
							*Please provide a file
						</div>

					</div>
				</div>
				<div style={{ display: 'flex', justifyContent: 'center' }}>
					<div style={{ width: '50%', display: 'flex' }}>
						<label for="file-upload" className="custom-file-input-label">
							<Icon icon="solar:file-outline" width="20" height="20" />
							<div style={{ marginLeft: 5 }}>Choose File</div>
						</label>
						<span className="custom-file-name" id="file-name">Corpus filename</span>
						<input type="file" id="file-upload" onChange={() => updateFileName()} />
					</div>

				</div>
			</div>

			<div style={{ display: 'flex', justifyContent: 'center', }}>

				<Button label="Ready!" color="green" icon="solar:upload-outline" />

			</div>

			{ /*   

	<div style={{ marginTop: '5%' }}>
				<div style={{ display: "flex", flexDirection: "row", justifyContent: 'center' }}>
					<div className='info' style={{ width: 'max-content', fontSize: '14pt', }} onKeyUp={(evt) => handleInput(evt.target.value)}>
						Please enter the filepath to the folder that contains corpus documents: <br /><br /> <input placeholder="Corpus filename" style={{ width: '100%', fontSize: '14pt' }} />
					</div>
					{filepath.length > 0 ? <div /> : <div style={{ margin: '0.5%', padding: '1%', color: 'blue' }}>Please provide a path</div>}
				</div>
			</div>
			<div style={{ textAlign: 'center' }}><button style={{ width: 'max-content', fontSize: '14pt', padding: '0.5%', backgroundColor: '#54f07d' }} onClick={(evt) => handleButton()}>Ready!</button></div>
			<div>
				{error ? <div style={{ textAlign: 'center', padding: '1%', color: 'red' }}>Cannot locate {errorPath}.</div> : <div />}
				{error === false ? <div style={{ marginLeft: '-8%', margin: '0.5%', padding: '1%', textAlign: 'center' }}>All done! Your corpus is now ready to be used. <br />The corpus name is <b>{corpusFile}</b> and its associated default row labels are stored in <b>{rowsFile}</b>.</div> : <div />}
				{waiting ? <div><div style={{ textAlign: 'center', marginTop: '2%', marginBottom: '1%' }}>Preparing corpus...If this is a new corpus, this step can take a long time.</div><div className='spinner'></div></div> : <div />}
			</div>
*/}

		</DndProvider>
	);
}