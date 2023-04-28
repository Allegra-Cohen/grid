import Backend from "./Backend";
import Callback from "./Callback";

import {useState} from "react";

export default function CopyButton({apiurl}) {
    const [clicked, setClicked] = useState(false);

    const backend = new Backend(apiurl);

    const handleClick = new Callback("CopyButton.handleClick").get(evt => {
        evt.preventDefault();
        const request = backend.toRequest("copyToggle");
        backend.fetchThen(request, response => {
            setClicked(!clicked);
        });
    });

    const className = "CopyButton " + (clicked ? "CopyOn" : "CopyOff");
    const isClicked = clicked && 'clicked';

    return (
        <div className={className}>
            <button onClick={handleClick} clicked={isClicked}> Copy </button>
        </div>
    );
}
