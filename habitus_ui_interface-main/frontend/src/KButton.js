import Backend from "./Backend";

export default function KButton({apiurl}){
    const backend = new Backend(apiurl);

    return (
        <div className={"KButton"}>
            <input style={{height:"2em", width:"60%", fontSize:'20px', border: '1.5px solid #90c5e1'}}
                onInput={(evt) => {
                    const request = backend.toRequest("setK", ["k", evt.target.value]);
                    backend.fetch(request);
                }}
                placeholder=" Max. columns "
            />
        </div>
    );
}
