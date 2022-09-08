import {useDrop} from "react-dnd";
import {useId, useEffect, useState} from "react";

export default function Trash({onChange, onDrop, apiUrl}){
 
    const [{ isOver }, dropRef] = useDrop({
        accept: 'sentence',
        drop: (item) => {
            fetch(`${apiUrl}/trash/${item.text}`)
            .then( response => response.json())
            .then( data => {
                console.log(data);
                onDrop(data)
            });
            console.log([item]);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver()
        })
    })

    return (<div ref={dropRef} 

        style={{
            background: isOver ? 'skyblue' : "white",
            marginLeft: '1em',
            marginTop: '0.35em',
            fontSize: '40pt'}}
            >
           🗑
    </div>);
    }