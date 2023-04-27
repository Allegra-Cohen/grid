import Backend from "./Backend";
import Callback from "./Callback";

import {useEffect, useState} from "react";

import "./RegenerateButton.css";

export default function RegenerateButton({onClick, apiurl}) {
    const [disabled, setDisabled] = useState([]);

    const backend = new Backend(apiurl);

    useEffect(() => {
        setDisabled(false);
    }, []);

    const handleButtonClick = new Callback("RegenerateButton.handleButtonClick").get(evt => {
        setDisabled(true);
        const request = backend.toRequest("regenerate")
        backend.fetch(request, response => {
            onClick(response);
            setDisabled(false);
        });
    });

    return (
        <div className={"RegenerateButton"}>
            <button onClick={handleButtonClick} disabled={disabled}>Update Grid</button>
        </div>
    );
}
