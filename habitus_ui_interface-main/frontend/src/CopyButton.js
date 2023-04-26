import Backend from "./Backend"

import {useState} from "react";

export default function CopyButton({onClick, apiurl}){
    const [clicked, setClicked] = useState([false]);

    const backend = new Backend(apiurl);

    function onLaunchClicked(evt){
        evt.preventDefault();
        setClicked(!clicked);
    }

    return (
        <div className={"CopyButton"}>
            <button style={{height:'2.5em', width:'8em', background: clicked ? '#FFFFFF' : '#48e3d0', fontSize:'20px', fontFamily: "InaiMathi"}}
                onClick={ (evt) => {
                    const request = backend.toRequest("copyToggle");
                    backend.fetchThen(request, response => {
                        onClick(response);
                    });
                    onLaunchClicked(evt);
                }}
                clicked={clicked}
            >
                Copy
            </button>
        </div>
    );
}