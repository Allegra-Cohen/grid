import {useEffect, useState} from "react";
import {toQuery} from "./toEncoding";


export default function InputBox({text, onKeyPress, apiUrl}){
    const [textInput, setTextInput] = useState([]);

	  return (
	    <div className={"InputBox"}>
	      <input style={{height:"3em", width:"100%", fontSize:'20px', border: '1.5px solid #90c5e1'}}
	      onKeyPress={
      	     (evt) => {
     	        if (evt.key === "Enter") {
     	        	if (evt.target.value.length > 0){
						let query = toQuery([["text", evt.target.value]]);
						fetch(`${apiUrl}/textInput/${query}`)
				            .then( response => response.json())
				            .then( response => {console.log(response);
				                console.log(response);
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