import Backend from "./Backend";
import Callback from "./Callback";

export default function InputBox({text, onKeyPress, apiurl}) {
    const backend = new Backend(apiurl);

    const handleInput = new Callback("InputBox.handleInput").get(evt => {
        if (evt.key === "Enter") {
            if (evt.target.value.length > 0) {
                const request = backend.toRequest("textInput", ["text", evt.target.value]);
                backend.fetchThen(request, response => {
                    onKeyPress(response);
                    evt.target.value = "";
                    evt.target.blur();
                })
            }
        }
    });

    return (
        <div className="InputBox">
            <input onKeyPress={handleInput} placeholder=" Create new column " />
        </div>
    );
}
