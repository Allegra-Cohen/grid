import Backend from "./Backend";
import Callback from "./Callback";

import "./SaveBox.css";

export default function SaveAsBox({text, apiurl}){
    const backend = new Backend(apiurl);

    const handleKeyPress = new Callback("SaveAsBox.handleKeyPress").get(evt => {
        if (evt.key === "Enter") {
            const request = backend.toRequest("saveAsGrid", ["text", evt.target.value]);
            backend.fetchThen(request, response => {
                evt.target.value = ""
                evt.target.blur()
            });
        }
    });

    return (
        <div className="SaveBox">
            <input onKeyPress={handleKeyPress} placeholder=" Save as " />
        </div>
    );
}
