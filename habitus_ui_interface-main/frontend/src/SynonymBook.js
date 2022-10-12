import {useEffect, useState} from "react";

export default function SynonymBook({synonymBook, apiUrl}){

	const [items, setItems] = useState(synonymBook);

	useEffect(() => {
        fetch(`${apiUrl}/data/`)
            .then( response => response.json())
            .then( data => {
                setItems(data.synonym_book);;
            });
    }, [])

	const [newKey, setNewKey] = useState('');
	const [newValue, setNewValue] = useState([]);

	const handleAddSynonymClick = () => {

		const newDict = {}
		newDict[newKey] = newValue;	
		console.log("NV: ", newValue)	
		setItems(items => ({...items, ...newDict}));
		console.log('!!', items);
		
	};


	const handleListClick = (plus_or_minus) => {

		const newDict = {}

		if (plus_or_minus == '+'){
			if (!(items[newKey].includes(newValue))) {
				newDict[newKey] = items[newKey].concat(newValue);
			}
		} else {
			const index = items[newKey].indexOf(newValue);
			if (index > -1) {
			  newDict[newKey] = items[newKey].filter((item, i) => i !== index)
			}
		}
		setItems(items => ({...items, ...newDict}));
		console.log(items);
		
	};



	return (<div style={{marginLeft:'10px', paddingLeft:'10px', marginTop:'20px', paddingTop:'10px', paddingBottom:'10px', background:'#dcf6ff', width:'900px'}}>
				<div className='add-item-box'>
					<input onChange={(evt) => {setNewKey(evt.target.value); setNewValue([])}} className='add-item-input' placeholder='Add a word...' />
					<button onClick={(evt) => {handleAddSynonymClick(); setNewKey(''); evt.target.blur()}}>+</button>
				</div>
				<h3> Synonym Book </h3>
				<div className='item-list'>
					{Object.entries(items).map(([key, value]) => (
						<div style={{display:'flex', flexDirection:'row'}}>
						<div className='item-container'>
							<b>{key}</b>: {value.size == 0 ? value : value.map((val) => <span>{val}, </span>)}
						</div>
						<div style={{marginLeft:'10px'}}>
						<input onChange={(evt) => {setNewKey(key); 
												setNewValue(evt.target.value)}} 
							   placeholder='Extend synonym...' />
						<button onClick={(evt) => {setNewKey(key); handleListClick('+'); setNewKey(''); setNewValue([]); evt.target.blur()}}>+</button>
						<button onClick={(evt) => {setNewKey(key); handleListClick('-'); setNewKey(''); setNewValue([]); evt.target.blur()}}>-</button>
						</div>
						</div>

					))}

				</div>
			</div>

	);

}