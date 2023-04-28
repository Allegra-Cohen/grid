import Backend from "./Backend";
import Callback from "./Callback";

export default function KButton({apiurl}){
    const backend = new Backend(apiurl);

    const handleInput = new Callback("KButton.handleInput").get(evt => {
        const request = backend.toRequest("setK", ["k", evt.target.value]);
        backend.fetch(request);
    });

    return (
        <div className={"KButton"}>
            <input onInput={handleInput} placeholder=" Max. columns " />
        </div>
    );
}
