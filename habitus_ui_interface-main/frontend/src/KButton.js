import {useEffect, useState} from "react";


export default function KButton({apiUrl}){
    const [kInput, setKInput] = useState([]);

	  return (
	    <div className={"KButton"}>
	      <input style={{height:"2em", width:"60%", fontSize:'20px', border: '1.5px solid #90c5e1'}}
	      onInput={
      	     (evt) => {
 	        	let k = evt.target.value;
 	        	console.log(k);
		        fetch(`${apiUrl}/setK/${k}`)
		            .then( response => response.json())}
           }
           placeholder=" Max. columns "
           />
	    </div>
	  );
}