import Backend from "./Backend";

import {useState} from "react";

function SynonymEntry({entryIndex, entry, onUpdate, apiurl}) {
    const [newWord, setNewWord] = useState();

    const backend = new Backend(apiurl);

    const handleInput = (text) => {
        setNewWord(text);
    }

    const handleDeleteWord = (entryIndex, word) => {
        const request = backend.toRequest("removeFromSynBook", ["entryIndex", entryIndex], ["word", word]);
        backend.fetchThen(request, response => {
            onUpdate(response);
        });
    }

    const handleAddWord = (entryIndex) => {
        const request = backend.toRequest("addToSynBook", ["entryIndex", entryIndex], ["newWord", newWord]);
        backend.fetchThen(request, response => {
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

    const backend = new Backend(apiurl);

    const handleInput = (text) => {
        setNewEntry(text);
    }

    const handleAddEntry = () => {
        const request = backend.toRequest("addToSynBook", ["id", synonymBook.length + 1], ["newEntry", newEntry]);
        backend.fetchThen(request, response => {
            onUpdate(response);
        });
    }

    let entries = synonymBook.map((entry, i) => <SynonymEntry key={entry} entryIndex={i} entry={entry} onUpdate={onUpdate} apiurl={apiurl}/>)

    return (
        <div style={{padding:'1%', marginTop:'5%', marginLeft: '6%', background:'#f0f7fd', border: 'solid', borderColor: '#87c1ff', borderWidth: '1pt', width: 'max-content'}}>
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
