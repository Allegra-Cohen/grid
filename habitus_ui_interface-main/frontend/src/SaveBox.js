import {useEffect, useState} from "react";


export default function SaveAsBox({text, apiurl}){

	  return (
	    <div className={"SaveBox"}>
	      <input style={{height:"2em", color:'black', fontSize: '13pt', border: '1.5px solid #90c5e1'}}
	      onKeyPress={
      	     (evt) => {
     	        if (evt.key === "Enter") {
     	        	let text = evt.target.value;
			        fetch(`${apiurl}/saveAsGrid/${text}`)
			            .then( response => response.json())
			            .then( response => {console.log(response)})
			            .then(evt.target.value = '')
			            .then(evt.target.blur())
	               }
	           }
           } 
           placeholder=" Save as "
           />
	    </div>
	  );
}