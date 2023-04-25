import {toQuery} from "./toEncoding";

import {useDrop} from "react-dnd";

export default function Trash({onChange, onDrop, apiurl}){
 
    const [{ isOver }, dropRef] = useDrop({
        accept: 'gridIcon',
        drop: (item) => {
            let answer = window.confirm("Delete Grid? This cannot be undone")
            console.log(answer)
            if (answer) {
                let query = toQuery([["text", item.gridName]]);
                fetch(`${apiurl}/deleteGrid/${query}`)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        onDrop(data)
                    }
                );
            }
            console.log([item]);
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
