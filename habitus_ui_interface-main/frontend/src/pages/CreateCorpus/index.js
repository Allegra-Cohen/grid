import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useId, useEffect, useState } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { BackButton, Button, Header, Loading } from 'components'
import { Icon } from '@iconify/react';
import { fetchDataFromApi, toQuery } from 'services';

function CreateCorpus() {

	const [grids, setGrids] = useState([]);
	const [filepath, setFilepath] = useState([]);
	const [filename, setFilename] = useState('');
	const [anchor, setAnchor] = useState([]);
	const [rowFilename, setRowFilename] = useState('');
	const [supercorpus, setSupercorpus] = useState('');
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
					setWaiting(false);
					if (data.error) {
						setError(true);
						setErrorText(data.error);
						console.log(data.error)
					} else {
						navigate('/grid')
					}
				}).catch(err => {
					setErrorText(err.message)
					setWaiting(false)
				})
		}
	}

	function updateSuperCorpus() {

		const input = document.getElementById('superCorpus-upload');
		const fileNameContainer = document.getElementById("superCorpus-name");

		if (input.files.length > 0) {
			fileNameContainer.textContent = input.files[0].name;
			setSupercorpus(input.files[0].name)
		} else {
			fileNameContainer.textContent = "Nenhum arquivo selecionado";
		}
	}

	function updateRowName() {

		const input = document.getElementById('rowName-upload');
		const fileNameContainer = document.getElementById("rowName-name");

		if (input.files.length > 0) {
			fileNameContainer.textContent = input.files[0].name;
			setRowFilename(input.files[0].name)
		} else {
			fileNameContainer.textContent = "Nenhum arquivo selecionado";
		}
	}

	return (
		<>
			<Header>
				<BackButton screenName="Create a new Grid" />
			</Header>

			<div className='container-input-fileName'>
				<div>
					<div className='center-component'>
						<div className='input-create'>
							<div className='label' >
								Which corpus will you use?
							</div>
							{!supercorpus && (
								<div className="provide-fileName">
									*Please provide a filename
								</div>
							)}
						</div>
					</div>
					<div className='center-component'>
						<div className='input-text'>
							<label htmlFor="superCorpus-upload" className="custom-file-input-label">
								<Icon icon="solar:file-outline" width="20" height="20" />
								<div>Choose File</div>
							</label>
							<span className="custom-file-name" id="superCorpus-name">Corpus filename</span>
							<input type="file" id="superCorpus-upload" onChange={() => updateSuperCorpus()} />
						</div>
					</div>
				</div>

				<div>
					<div className='center-component'>
						<div className='input-create'>
							<div className='label' >
								Which row labels will you use?
							</div>
							{!rowFilename && (
								<div className="provide-fileName">
									*Please provide a filename
								</div>
							)}
						</div>
					</div>
					<div className='center-component'>
						<div className='input-text'>
							<label htmlFor="rowName-upload" className="custom-file-input-label">
								<Icon icon="solar:file-outline" width="20" height="20" />
								<div>Choose File</div>
							</label>
							<span className="custom-file-name" id="rowName-name">Row labels filename</span>
							<input type="file" id="rowName-upload" onChange={() => updateRowName()} />
						</div>
					</div>
				</div>

				<div>
					<div className='center-component'>
						<div className='input-create'>
							Do you want to anchor your Grid?
						</div>
					</div>
					<div className='center-component'>
						<div className="input-text">
							<input className="custom-file-name" id="file-name" placeholder='Anchor term' onChange={(evt) => handleInput('anchor', evt.target.value)} />
						</div>
					</div>
				</div>
				<div>
					<div className='center-component'>
						<div className='input-create'>
							<div>
								What filename do you want to save your Grid with?
							</div>
							{!filename && (
								<div className="provide-fileName">
									*Please provide a filename
								</div>
							)}
						</div>
					</div>
					<div className='center-component'>
						<div className="input-text">
							<input className="custom-file-name" id="file-name" placeholder='Filename' onChange={(evt) => handleInput('filename', evt.target.value)} />
						</div>
					</div>
				</div>
				<div className='center-component'>
					<Button label="Ready!" color="green" icon="solar:upload-outline" onClick={() => handleButton()} />
				</div>
				<div>
					{true &&
						<div className='center-component'
							style={{ color: 'red' }}>
							{errorText}
						</div>
					}
					{waiting &&
						<div>
							<div className='center-component'>
								<Loading />
							</div>
							<div className='center-component'>
								Loading corpus...If this is a new corpus, this step may take several minutes.
							</div>
						</div>
					}
				</div>
			</div>

		</>
	);
}

export default CreateCorpus;