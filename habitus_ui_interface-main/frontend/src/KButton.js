import {toRequest} from "./toEncoding";

// import {useState} from "react";

export default function KButton({apiurl}){
    // const [kInput, setKInput] = useState([]);

    return (
        <div className={"KButton"}>
            <input style={{height:"2em", width:"60%", fontSize:'20px', border: '1.5px solid #90c5e1'}}
                onInput={(evt) => {
                    let request = toRequest(apiurl, "setK", [["k", evt.target.value]]);
                    fetch(request)
                        .then(response => response.json())
                }}
                placeholder=" Max. columns "
            />
        </div>
    );
}
