import Backend from "./Backend";
import Callback from "./Callback";
import Trash from "./Trash";

import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {Link} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import {useDrag} from "react-dnd";

import "./Gallery.css";
import "./info.css";
import "./Page.css";

function GridIcon({gridName, onGridClick}) {

    const handleCollect = new Callback("GridIcon.handleCollect").get(monitor => {
        const result = {isDragging: monitor.isDragging()};
        return result;
    });

    const [{isDragging}, dragRef] = useDrag({
        type: "gridIcon",
        item: {gridName},
        collect: handleCollect
    });

    const handleClick = new Callback("GridIcon.handleClick").get(() => {
        onGridClick(gridName);
    });

    return (
        <Link ref={dragRef} className="gallery" to="/grid" onClick={handleClick}>
            {gridName}{isDragging}
        </Link>
    );
}

export default function Gallery({apiurl}) {
    const [grids, setGrids] = useState([]);
    const [numCols, setNumCols] = useState("1");

    const backend = useMemo(() => new Backend(apiurl), [apiurl]);

    useEffect(() => {
        const request = backend.toRequest("showGrids")
        backend.fetchThen(request, response => {
            setGrids(response.grids);
            setNumCols(grids.length === 1 ? "1" : "2")
        });
    }, [backend, numCols, grids.length]);

    const handleGridClick = new Callback("Gallery.handleGridClick").get(gridName => {
        const request = backend.toRequest("loadGrid", ["text", gridName]);
        backend.fetch(request);
    });

    const handleTrashDrop = new Callback("Gallery.handleTrashDrop").get(evt => {
        const request = backend.toRequest("showGrids");
        backend.fetchThen(request, response => {
            setGrids(response.grids);
            setNumCols(grids.length === 1 ? "1" : "2");
        });
    });

    const items = grids.map((gridName, i) => (
        <GridIcon key={gridName} gridName={gridName} onGridClick={handleGridClick} />
    ));

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="banner" />
            <h1 style={{marginLeft:"5%", color:"#060e4e"}}>Grids:</h1>
            <div>
                <ul style={{columns:numCols, marginLeft:"3.5%"}}>
                    {items}
                </ul>
            </div>

            <div className="flexRow" style={{marginLeft:"6%"}}>
                <div style={{marginLeft:"42%", marginTop:"1%"}}>
                    <Trash className="Trash" onDrop={handleTrashDrop} apiurl={apiurl} />
                </div>
            </div>
            <div className="info">
                <Link to="/create"> Create new Grid! </Link>
            </div>
            <div className="info">
                <Link to="/changeCorpus"> Upload or update corpus </Link>
            </div>
            <div className="info">
                <Link to="/changeBeliefs"> Update beliefs </Link>
            </div>
        </DndProvider>
    );
}
