import {useEffect, useState} from "react";
import {toQuery} from "./toEncoding";

export default function KButton({apiurl}){
    const [kInput, setKInput] = useState([]);

	  return (
	    <div className={"KButton"}>
	      <input style={{height:"2em", width:"60%", fontSize:'20px', border: '1.5px solid #90c5e1'}}
	      onInput={
      	     (evt) => {
 	        	let query = toQuery([["k", evt.target.value]]);
		        fetch(`${apiurl}/setK/${query}`)
		            .then( response => response.json())}
           }
           placeholder=" Max. columns "
           />
	    </div>
	  );
}