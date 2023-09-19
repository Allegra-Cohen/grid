import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useId, useEffect, useState } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import './info.css';
import './Spinner.css';
import { toQuery } from "./toEncoding";
import { BackButton, Button, Header } from './components'
import { Icon } from '@iconify/react';
import { fetchDataFromApi } from './services';

function CreatePage() {

	const [grids, setGrids] = useState([]);
	const [filepath, setFilepath] = useState([]);
	const [filename, setFilename] = useState([]);
	const [anchor, setAnchor] = useState([]);
	const [rowFilename, setRowFilename] = useState([]);
	const [supercorpus, setSupercorpus] = useState([]);
	const [validFile, setValidFile] = useState([]);
	const [error, setError] = useState(false);
	const [errorText, setErrorText] = useState(false);
	const [waiting, setWaiting] = useState(false);

	useEffect(() => {
		fetchDataFromApi(`/showGrids/`)
			.then(data => {
				setGrids(data.grids);
				setFilepath(data.filepath);
			});
	}, [])

	const navigate = useNavigate();

	const handleInput = (variable, text) => {
		if (variable === 'filename') {
			if (grids.includes(text)) {
				setValidFile(false)
			} else {
				setFilename(text)
				setValidFile(true)
			}
		} else if (variable === 'anchor') {
			setAnchor(text)
		} else if (variable === 'rowname') {
			setRowFilename(text)
		} else {
			setSupercorpus(text)
		}
	}

	const handleButton = () => {
		let text = 'load_all'

		if (validFile && rowFilename.length > 0) {
			if (anchor.length > 0) {
				text = anchor
			}
			setWaiting(true)
			setError(false)
			let query = toQuery([["corpusFilename", supercorpus], ["rowFilename", rowFilename], ["newFilename", filename], ["newAnchor", text]]);
			fetchDataFromApi(`/loadNewGrid/${query}`)
				.then(data => {
					console.log(data);
					setWaiting(false);
					if (data.error) {
						setError(true);
						setErrorText(data.error);
						console.log(data.error)
					} else {
						navigate('/grid')
					}
				})
		}
	}

	function updateFileName() {
		console.log('updateFileName')
		const input = document.getElementById("file-upload");
		const fileNameContainer = document.getElementById("file-name");
		console.log(fileNameContainer, input)

		if (input.files.length > 0) {
			fileNameContainer.textContent = input.files[0].name;
			setSupercorpus(input.files[0].name)
		} else {
			fileNameContainer.textContent = "Nenhum arquivo selecionado";
		}
	}


	return (
		<DndProvider backend={HTML5Backend}>
			<Header>
				<div className="leftContent">
					<BackButton screenName="Create a new Grid" />
				</div>
			</Header>

			{/* 
				<div style={{ marginTop: '5%' }}>
				<div style={{ display: "flex", flexDirection: "row" }}>
					<div className='info' style={{ width: 'max-content', marginLeft: '37%' }} onKeyUp={(evt) => handleInput('corpus', evt.target.value)}>Which corpus will you use? <input placeholder="Corpus filename" /></div>
					{supercorpus.length == 0 && !error ? <div style={{ margin: '0.5%', padding: '1%', color: 'blue' }}>Please provide a filename</div> : <div />}
				</div>
				<div style={{ display: "flex", flexDirection: "row" }}>
					<div className='info' style={{ width: 'max-content', marginLeft: '36.6%' }} onKeyUp={(evt) => handleInput('rowname', evt.target.value)}>Which row labels will you use? <input placeholder="Row labels filename" /></div>
					{rowFilename.length == 0 && !error ? <div style={{ margin: '0.5%', padding: '1%', color: 'blue' }}>Please provide a filename</div> : <div />}
				</div>
				<div className='info' style={{ width: 'max-content', marginLeft: '36%' }} onKeyUp={(evt) => handleInput('anchor', evt.target.value)}>Do you want to anchor your Grid? <input placeholder="Anchor term" /></div>
				<div style={{ display: "flex", flexDirection: "row" }}>
					<div className='info' style={{ width: 'max-content', marginLeft: '33%' }} onKeyUp={(evt) => handleInput('filename', evt.target.value)}>What filename do you want to save your Grid with? <input placeholder="Filename" /></div>
					{validFile ? <div /> : <div style={{ margin: '0.5%', padding: '1%', color: 'red' }}>That filename already exists</div>}
					{filename.length > 0 ? <div /> : <div style={{ margin: '0.5%', padding: '1%', color: 'blue' }}>Please provide a filename</div>}
				</div>
			</div>
			<button style={{ width: 'max-content', marginLeft: '44%', fontSize: '14pt', padding: '0.5%', backgroundColor: '#54f07d' }} onClick={(evt) => handleButton()}>Ready!</button>
			<div>
				{error ? <div style={{ marginLeft: '26%', margin: '0.5%', padding: '1%', color: 'red' }}>{errorText}</div> : <div />}
				{waiting ? <div><div style={{ marginLeft: '34%', marginTop: '2%', marginBottom: '1%' }}>Loading corpus...If this is a new corpus, this step may take several minutes.</div><div className='spinner' style={{ marginLeft: '44%' }}></div></div> : <div />}
			</div>
		
			
			*/}
			<div style={{ marginBottom: 15 }}>

				<div style={{ display: 'flex', justifyContent: 'center', marginBottom: 5 }}>
					<div className='inputCreate'>
						<div style={{ color: '#707273', fontWeight: 500 }} >
							Which corpus will you use?
						</div>
						{supercorpus.length === 0 && (
							<div style={{ color: 'red', display: 'flex', justifyContent: 'flex-end', flex: 1 }}>
								*Please provide a filename
							</div>
						)}
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

			<div style={{ marginBottom: 15 }}>
				<div style={{ display: 'flex', justifyContent: 'center', marginBottom: 5 }}>
					<div className='inputCreate'>
						<div style={{ color: '#707273', fontWeight: 500 }} >
							Which row labels will you use?
						</div>
						<div style={{ color: 'red', display: 'flex', justifyContent: 'flex-end', flex: 1 }}>
							*Please provide a filename
						</div>
					</div>
				</div>

				<div style={{ display: 'flex', justifyContent: 'center' }}>
					<div style={{ width: '50%', display: 'flex' }}>
						<label for="file-upload" className="custom-file-input-label">
							<Icon icon="solar:file-outline" width="20" height="20" />
							<div style={{ marginLeft: 5 }}>Choose File</div>
						</label>
						<span className="custom-file-name" id="file-name">Row labels filename</span>
						<input type="file" id="file-upload" onChange={() => updateFileName()} />
					</div>

				</div>
			</div>

			<div style={{ marginBottom: 15 }}>

				<div style={{ display: 'flex', justifyContent: 'center', marginBottom: 5 }}>
					<div className='inputCreate'>
						<div style={{ color: '#707273', fontWeight: 500 }} >
							Do you want to anchor your Grid?
						</div>

					</div>
				</div>

				<div style={{ display: 'flex', justifyContent: 'center' }}>
					<div style={{ width: '50%', display: 'flex' }}>

						<input className="custom-file-name" id="file-name" placeholder='Anchor term' />

					</div>

				</div>
			</div>

			<div style={{ marginBottom: 15 }}>

				<div style={{ display: 'flex', justifyContent: 'center', marginBottom: 5 }}>
					<div className='inputCreate'>
						<div style={{ color: '#707273', fontWeight: 500 }} >
							What filename do you want to save your Grid with?
						</div>
						<div style={{ color: 'red', display: 'flex', justifyContent: 'flex-end', flex: 1 }}>
							*Please provide a filename
						</div>
					</div>
				</div>

				<div style={{ display: 'flex', justifyContent: 'center' }}>
					<div style={{ width: '50%', display: 'flex' }}>

						<input className="custom-file-name" id="file-name" placeholder='Filename' />
					</div>

				</div>
			</div>

			<div style={{ display: 'flex', justifyContent: 'center', }}>

				<Button label="Ready!" color="green" icon="solar:upload-outline" />

			</div>

			<div>
				{error ? <div style={{ marginLeft: '26%', margin: '0.5%', padding: '1%', color: 'red' }}>{errorText}</div> : <div />}
				{waiting ? <div><div style={{ marginLeft: '34%', marginTop: '2%', marginBottom: '1%' }}>Loading corpus...If this is a new corpus, this step may take several minutes.</div><div className='spinner' style={{ marginLeft: '44%' }}></div></div> : <div />}
			</div>
		</DndProvider>
	);
}

export default CreatePage;