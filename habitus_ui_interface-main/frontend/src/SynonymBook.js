import {useEffect, useState} from "react";
import {toQuery} from "./toEncoding";




function SynonymEntry({entryIndex, entry, onUpdate, apiurl}){

	const [newWord, setNewWord] = useState();

	const handleInput = (text) => {
		setNewWord(text);
	}

	const handleDeleteWord = (entryIndex, word) => {
		let query = toQuery([["entryIndex", entryIndex], ["word", word]]);
		fetch(`${apiurl}/removeFromSynBook/${query}`)
			.then( response => response.json())
            .then( response => {
            	onUpdate(response);
            });
	}

	const handleAddWord = (entryIndex) => {
		let query = toQuery([["entryIndex", entryIndex], ["newWord", newWord]]);
		fetch(`${apiurl}/addToSynBook/${query}`)
			.then( response => response.json())
            .then( response => {
            	onUpdate(response);
            });
	}


	return(
		<div style={{margin:'5%', padding:'4%', backgroundColor:'#a9d3ff', width: '70%'}}>
		{
			entry.map((word, j) => 
				<div key={word} style={{display:'flex', flexDirection:'row'}}>
				<button style={{backgroundColor:'#f76a6a'}} onClick={()=> handleDeleteWord(entryIndex, word)}>-</button>
				<div style={{padding:'1%'}}>{word}</div>
				</div>
				)
		}
		<div style={{display:'flex', flexDirection:'row'}}>
		<button style={{backgroundColor:'#74d681'}} onClick={()=> handleAddWord(entryIndex)}>+</button>
		<input id="wordInput" placeholder="Add synonym" onKeyUp={(evt) => handleInput(evt.target.value)} style={{width:'70%'}}/>
		</div>
		</div>
		);

}

export default function SynonymBook({synonymBook, onUpdate, apiurl}){

	const [newEntry, setNewEntry] = useState();

	const handleInput = (text) => {
		setNewEntry(text);
	}

	const handleAddEntry = () => {
		let query = toQuery([["id", synonymBook.length + 1], ["newEntry", newEntry]]);
		fetch(`${apiurl}/addToSynBook/${query}`)
			.then( response => response.json())
            .then( response => {
            	onUpdate(response);
            });
	}


	let entries = synonymBook.map((entry, i) => <SynonymEntry key={entry} entryIndex={i} entry={entry} onUpdate={onUpdate} apiurl={apiurl}/>)

	return (<div style={{padding:'1%', marginTop:'5%', marginLeft: '6%', background:'#f0f7fd', border: 'solid', borderColor: '#87c1ff', borderWidth: '1pt', width: 'max-content'}}>
				<div style={{fontSize:'18pt', color:'#0c1057'}}> Synonyms </div>
		
			 <ul>{entries}</ul>
			<div> 
			<div style={{display:'flex', flexDirection:'row'}}>
			<button style={{backgroundColor:'#74d681'}} onClick={()=> handleAddEntry()}>+</button>
			<input id="wordInput" placeholder="Add new entry" onKeyUp={(evt) => handleInput(evt.target.value)} style={{width:'70%'}}/>
			</div>
			</div>

			</div>
	);

}