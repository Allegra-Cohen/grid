import {useEffect, useState} from "react";


export default function SaveBox({text, apiUrl}){

	  return (
	    <div className={"SaveBox"}>
	      <input style={{height:"2.2em", width:"200px", fontSize:'18px', border: '1.5px solid #90c5e1'}}
	      onKeyPress={
      	     (evt) => {
     	        if (evt.key === "Enter") {
     	        	let text = evt.target.value;
			        fetch(`${apiUrl}/saveGrid/${text}`)
			            .then( response => response.json())
			            .then( response => {console.log(response)})
			            .then(evt.target.value = '')
			            .then(evt.target.blur())
	               }
	           }
           } 
           placeholder=" Save grid "
           />
	    </div>
	  );
}