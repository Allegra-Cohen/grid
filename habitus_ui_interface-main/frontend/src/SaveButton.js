import {useEffect, useState} from "react";


export default function SaveButton({onClick, apiUrl}){

    return(
    <div className={"SaveButton"}>
    <button style={{height:'2.5em', width:'8em', background: '#FFFFFF', fontSize:'20px', fontFamily: "InaiMathi"}}
    onClick={ (evt) => {fetch(`${apiUrl}/saveGrid/`);
                        console.log("save click!")}
           }
           >Save Grid</button>
    </div>
    );
}