import {toQuery} from "./toEncoding";

export default function LoadBox({text, onKeyPress, apiurl}){

    return (
        <div className={"LoadBox"}>
            <input style={{height:"2.2em", width:"200px", fontSize:'18px', border: '1.5px solid #90c5e1'}}
                onKeyPress={(evt) => {
                    if (evt.key === "Enter") {
                        let query = toQuery([["text", evt.target.value]]);
                        fetch(`${apiurl}/loadGrid/${query}`)
                            .then(response => response.json())
                            .then(response => {
                                console.log(response);
                                console.log(response);
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
