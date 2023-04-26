import Backend from "./Backend";

import {useDrop} from "react-dnd";

export default function Trash({onChange, onDrop, apiurl}){
    const backend = new Backend(apiurl);

    const [{ isOver }, dropRef] = useDrop({
        accept: 'gridIcon',
        drop: (item) => {
            let answer = window.confirm("Delete Grid? This cannot be undone")
            console.log("answer:", answer)
            if (answer) {
                const request = backend.toRequest("deleteGrid", ["text", item.gridName]);
                backend.fetchThen(request, response => {
                    onDrop(response);
                });
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver()
        })
    })

    return (
        <div ref={dropRef} 
            style={{
                background: isOver ? 'skyblue' : "white",
                fontSize: '40pt'
            }}
        >
            🗑
        </div>
    );
}
