import {toRequest} from "./toEncoding";

import {useDrop} from "react-dnd";

export default function Trash({onChange, onDrop, apiurl}){
 
    const [{ isOver }, dropRef] = useDrop({
        accept: 'gridIcon',
        drop: (item) => {
            let answer = window.confirm("Delete Grid? This cannot be undone")
            console.log("answer:", answer)
            if (answer) {
                let request = toRequest(apiurl, "deleteGrid", [["text", item.gridName]]);
                fetch(request)
                    .then(response => response.json())
                    .then(data => {
                        console.log("data:", data);
                        onDrop(data)
                    }
                );
            }
            console.log("item:", [item]);
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
