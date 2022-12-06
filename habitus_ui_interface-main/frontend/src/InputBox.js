import {useEffect, useState} from "react";


export default function InputBox({text, onKeyPress, apiUrl, userID}){
    const [textInput, setTextInput] = useState([]);

	  return (
	    <div className={"InputBox"}>
	      <input style={{height:"3em", width:"100%", fontSize:'20px', border: '1.5px solid #90c5e1'}}
	      onKeyPress={
      	     (evt) => {
     	        if (evt.key === "Enter") {
     	        	let text = evt.target.value.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g," ");
     	        	if (evt.target.value.length > 0){
			        fetch(`${apiUrl}/textInput/${text}/${userID}`)
			            .then( response => response.json())
			            .then( response => {
			                onKeyPress(response);
			                        })
			            .then(evt.target.value = '')
			            .then(evt.target.blur())
	               }
	           }
	           }
           } 
           placeholder=" Create new column "
           />
	    </div>
	  );
}