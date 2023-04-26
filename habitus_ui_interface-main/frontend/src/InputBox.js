import Backend from "./Backend";

export default function InputBox({text, onKeyPress, apiurl}) {
    const backend = new Backend(apiurl);

    return (
        <div className={"InputBox"}>
            <input style={{height:"3em", width:"100%", fontSize:'20px', border: '1.5px solid #90c5e1'}}
                onKeyPress={(evt) => {
                    if (evt.key === "Enter") {
                        if (evt.target.value.length > 0) {
                            const request = backend.toRequest("textInput", ["text", evt.target.value]);
                            backend.fetchThen(request, response => {
                                onKeyPress(response);
                                evt.target.value = ''
                                evt.target.blur()
                            })
                        }
                    }
                }} 
                placeholder=" Create new column "
            />
        </div>
    );
}
