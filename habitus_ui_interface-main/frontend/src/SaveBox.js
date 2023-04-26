import Backend from "./Backend";

export default function SaveAsBox({text, apiurl}){
    const backend = new Backend(apiurl);

    return (
        <div className={"SaveBox"}>
            <input style={{height:"2em", color:'black', fontSize: '13pt', border: '1.5px solid #90c5e1'}}
                onKeyPress={(evt) => {
                    if (evt.key === "Enter") {
                        const request = backend.toRequest("saveAsGrid", ["text", evt.target.value]);
                        backend.fetchThen(request, response => {
                            evt.target.value = ''
                            evt.target.blur()
                        });
                    }
                }} 
                placeholder=" Save as "
            />
        </div>
    );
}
