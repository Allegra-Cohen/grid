import Backend from "./Backend";
import Callback from "./Callback";

import "./LoadBox.css";

export default function LoadBox({text, onKeyPress, apiurl}) {
    const backend = new Backend(apiurl);

    const handleInput = new Callback("LoadBox.handleInput").get(evt => {
        if (evt.key === "Enter") {
            const request = backend.toRequest("loadGrid", ["text", evt.target.value]);
            backend.fetchThen(request, response => {
                onKeyPress(response);
                evt.target.value = '';
                evt.target.blur();
            });
        }
    });

    return (
        <div className={"LoadBox"}>
            <input onKeyPress={handleInput} placeholder=" Load grid " />
        </div>
    );
}
