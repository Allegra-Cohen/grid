import Backend from "./Backend";

export default function LoadBox({text, onKeyPress, apiurl}) {
    const backend = new Backend(apiurl);

    return (
        <div className={"LoadBox"}>
            <input style={{height:"2.2em", width:"200px", fontSize:'18px', border: '1.5px solid #90c5e1'}}
                onKeyPress={(evt) => {
                    if (evt.key === "Enter") {
                        const request = backend.toRequest("loadGrid", ["text", evt.target.value]);
                        backend.fetchThen(request, response => {
                            onKeyPress(response);
                            evt.target.value = ''
                            evt.target.blur()
                        })
                    }
                }}
                placeholder=" Load grid "
            />
        </div>
    );
}
