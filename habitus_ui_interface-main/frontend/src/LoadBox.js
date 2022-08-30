import {useEffect, useState} from "react";


export default function LoadBox({text, onKeyPress, apiUrl}){

	  return (
	    <div className={"LoadBox"}>
	      <input style={{height:"3em", width:"100%", fontSize:'20px', border: '1.5px solid #90c5e1'}}
	      onKeyPress={
      	     (evt) => {
     	        if (evt.key === "Enter") {
     	        	let text = evt.target.value;
			        fetch(`${apiUrl}/loadGrid/${text}`)
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
           placeholder=" Load a grid by typing its anchor "
           />
	    </div>
	  );
}