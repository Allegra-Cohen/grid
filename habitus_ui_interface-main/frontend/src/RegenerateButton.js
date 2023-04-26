import Backend from "./Backend"

import {useEffect, useState} from "react";

export default function RegenerateButton({onClick, apiurl}){
    const [disabled, setDisabled] = useState([]);

    const backend = new Backend(apiurl);

    useEffect(() => { setDisabled(false)}, [] )

    return (
        <div className={"RegenerateButton"}>
            <button style={{height:'2.5em', width:'8em', background:'#90c5e1', fontSize:'20px', fontFamily: "InaiMathi"}}
                onClick={(evt) => {
                    setDisabled(true);
                    const request = backend.toRequest("regenerate")
                    backend.fetch(request, response => {
                        onClick(response);
                        setDisabled(false);
                    });                        
                }}
                disabled={disabled}
            >
                Update Grid
            </button>
        </div>
    );
}
