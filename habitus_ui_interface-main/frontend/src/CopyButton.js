import Backend from "./Backend";
import Callback from "./Callback";

import {useState} from "react";

export default function CopyButton({onClick, apiurl}) {
    const [clicked, setClicked] = useState(false);

    const backend = new Backend(apiurl);

    const handleClick = new Callback("CopyButton.handleClick").get(evt => {
        evt.preventDefault();
        const request = backend.toRequest("copyToggle");
        backend.fetchThen(request, response => {
            onClick(response);
            setClicked(!clicked);
        });
    });

    const className = "CopyButton " + (clicked ? "CopyOn" : "CopyOff");

    return (
        <div className={className}>
            <button onClick={handleClick} clicked={clicked && 'clicked'}> Copy </button>
        </div>
    );
}
