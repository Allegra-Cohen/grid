import {toRequest} from "./toEncoding";

export default function SaveAsBox({text, apiurl}){

    return (
        <div className={"SaveBox"}>
            <input style={{height:"2em", color:'black', fontSize: '13pt', border: '1.5px solid #90c5e1'}}
                onKeyPress={(evt) => {
                    if (evt.key === "Enter") {
                        const request = toRequest(apiurl, "saveAsGrid", [["text", evt.target.value]]);
                        fetch(request)
                            .then(response => response.json())
                            .then(response => console.log("response:", response))
                            .then(evt.target.value = '')
                            .then(evt.target.blur()
                        )
                    }
                }} 
                placeholder=" Save as "
            />
        </div>
    );
}
