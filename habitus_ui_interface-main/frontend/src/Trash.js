import Backend from "./Backend";
import Callback from "./Callback";

import {useDrop} from "react-dnd";

import "./Trash.css"

export default function Trash({onDrop, apiurl}) {
    const backend = new Backend(apiurl);

    const handleDrop = new Callback("Trash.handleDrop").log1(item => {
        const answer = window.confirm("Delete Grid? This cannot be undone.");
        if (answer) {
            const request = backend.toRequest("deleteGrid", ["text", item.gridName]);
            backend.fetchThen(request, response => {
                onDrop(response);
            });
        }
    });

    const [{isOver}, dropRef] = useDrop({
        accept: 'gridIcon',
        drop: handleDrop,
        collect: (monitor) => ({
            isOver: monitor.isOver()
        })
    });

    const className = "trash " + (isOver ? "trashAvailable" : "trashUnavailable");

    return (
        <div ref={dropRef} className={className}>🗑</div>
    );
}
