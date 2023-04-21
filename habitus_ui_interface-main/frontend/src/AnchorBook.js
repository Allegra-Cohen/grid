import {useEffect, useState} from "react";
import {toQuery} from "./toEncoding";

export default function AnchorBook({anchorBook, onButtonClick, apiurl}){

	const [items, setItems] = useState(anchorBook);

	useEffect(() => {
        fetch(`${apiurl}/data/`)
            .then( response => response.json())
            .then( response => {
							  const {data, beliefsAvailable} = response
                setItems(data.anchor_book);;
            });
    }, [])

	const [newKey, setNewKey] = useState('');
	const [newValue, setNewValue] = useState([]);

	const handleAddAnchorClick = () => {

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



	return (<div style={{marginLeft:'10px', paddingLeft:'10px', marginTop:'100px', paddingTop:'10px', paddingBottom:'10px', background:'#cce6fe', width:'900px'}}>
				<div className='add-item-box'>
					<input onChange={(evt) => {setNewKey(evt.target.value); setNewValue([])}} className='add-item-input' placeholder='Add an anchor...' />
					<button onClick={(evt) => {handleAddAnchorClick(); setNewKey(''); evt.target.blur()}}>+</button>
				</div>
				<h3> Anchor Book </h3>
				<div className='item-list'>
					{Object.entries(items).map(([key, value]) => (
						<div style={{display:'flex', flexDirection:'row'}}>
						<div className='item-container'>
							<b>{key}</b>: {value.size == 0 ? value : value.map((val) => <span>{val}, </span>)}
						</div>
						<div style={{marginLeft:'10px'}}>
						<input onChange={(evt) => {setNewKey(key); 
												setNewValue(evt.target.value)}} 
							   placeholder='Extend anchor...' />
						<button onClick={(evt) => {setNewKey(key); 
												  let query = toQuery([["newKey", newKey], ["newValue", newValue], ["cmd", "add"]]);
												  fetch(`${apiurl}/updateAnchorBook/${query}`).then(response => response.json()).then(response => {console.log(response); 
												  onButtonClick(response)}); 
												  handleListClick('+'); setNewKey(''); setNewValue([]); evt.target.blur()}}>+</button>
						<button onClick={(evt) => {setNewKey(key); 
												  let query = toQuery([["newKey", newKey], ["newValue", newValue], ["cmd", "remove"]]);
												  fetch(`${apiurl}/updateAnchorBook/${query}`).then(response => response.json()).then(response => {console.log(response); 
												  onButtonClick(response)}); 
												  handleListClick('-'); setNewKey(''); setNewValue([]); evt.target.blur()}}>-</button>
						</div>
						</div>

					))}

				</div>
			</div>

	);

}