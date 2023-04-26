import Backend from './Backend';
import Trash from './Trash'

import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Link} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import {useDrag} from "react-dnd";

import './info.css';

function GridIcon({gridName, handleGridClick, apiurl}) {
    const [{ isDragging }, dragRef] = useDrag({
        type: 'gridIcon',
        item: { gridName },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    })

    return (
        <Link to="/grid" className='gallery' ref={dragRef} style={{'color' : '#060e4e', 'fontSize':'14pt'}}
            onClick={()=>
                handleGridClick(gridName)
            }
        >
            {gridName}{isDragging}
        </Link>
    );
}

export default function Gallery({apiurl}) {
	const [grids, setGrids] = useState([]);
    const [numCols, setNumCols] = useState('1');

    const backend = useMemo(() => new Backend(apiurl), [apiurl]);

	const handleGridClick = (gridName) => {
		console.log("gridName:", gridName)
        const request = backend.toRequest("loadGrid", ["text", gridName]);
        backend.fetch(request);
	}

	useEffect(() => {
        const request = backend.toRequest("showGrids")
        backend.fetchThen(request, response => {
            setGrids(response.grids);
            setNumCols(grids.length === 1 ? '1' : '2')
        });
    }, [backend, numCols, grids.length])

    let items = grids.map((gridName, i) => (<GridIcon key={gridName} gridName={gridName} handleGridClick={handleGridClick} />))

	return (
        <DndProvider backend={HTML5Backend}>
            <div style={{background: "#a9d3ff", padding:"1.5%"}}></div>
            <h1 style={{marginLeft:"5%", color:'#060e4e'}}>Grids:</h1>
            <div>
                <ul style={{columns:numCols, marginLeft:"3.5%"}}>
                    {items}
                </ul>
            </div>

            <div style={{display:'flex', flexDirection:'row', marginLeft:'6%'}}>
                <div className = 'info' style={{width:'max-content'}}>
                    <Link to="/create" style={{fontSize:'14pt', color:'#060e4e', backgroundColor: '#f0f7fd'}}> Create new Grid! </Link>
                </div>
                <div style={{marginLeft:'42%', marginTop:'1%'}}>
                    <Trash className='Trash'
                        onDrop={(evt) => {
                            const request = backend.toRequest("showGrids");
                            backend.fetchThen(request, response => {
                                setGrids(response.grids);
                                setNumCols(grids.length === 1 ? '1' : '2')
                            });
                        }}
                        apiurl={apiurl}
                    />
                </div>
            </div>
            <div className = 'info' style={{width:'max-content', marginLeft:'6%'}}>
                <Link to="/changeCorpus" style={{fontSize:'14pt', color:'#060e4e', backgroundColor: '#f0f7fd'}}> Upload or update corpus </Link>
            </div>
            <div className = 'info' style={{width:'max-content', marginLeft:'6%'}}>
                <Link to="/changeBeliefs" style={{fontSize:'14pt', color:'#060e4e', backgroundColor: '#f0f7fd'}}> Update beliefs </Link>
            </div>
        </DndProvider>
    );
}
