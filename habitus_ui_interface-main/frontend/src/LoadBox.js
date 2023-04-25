import {toRequest} from "./toEncoding";

export default function LoadBox({text, onKeyPress, apiurl}){

    return (
        <div className={"LoadBox"}>
            <input style={{height:"2.2em", width:"200px", fontSize:'18px', border: '1.5px solid #90c5e1'}}
                onKeyPress={(evt) => {
                    if (evt.key === "Enter") {
                        const request = toRequest(apiurl, "loadGrid", [["text", evt.target.value]]);
                        fetch(request)
                            .then(response => response.json())
                            .then(response => {
                                console.log("response:", response);
                                onKeyPress(response);
                            })
                            .then(evt.target.value = '')
                            .then(evt.target.blur())
                    }
                }}
                placeholder=" Load grid "
            />
        </div>
    );
}
