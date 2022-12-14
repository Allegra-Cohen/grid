import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {useId, useEffect, useState} from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import {useDrag} from "react-dnd";
import { Link } from "react-router-dom";
import Trash from './Trash'
import './info.css';


function Grid({gridName, handleGridClick, apiUrl}) {

    const [{ isDragging }, dragRef] = useDrag({
        type: 'grid',
        item: { gridName },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    })

    return <Link to="/grid" className='gallery' ref={dragRef} style={{'color' : '#060e4e', 'fontSize':'14pt'}} onClick={()=>handleGridClick(gridName)}>{gridName}{isDragging}</Link>

}

function Gallery({apiUrl}) {

	const [grids, setGrids] = useState([]);
    const [numCols, setNumCols] = useState('1');

	const handleGridClick = (gridName) => {
		console.log(gridName)
		fetch(`${apiUrl}/loadGrid/${gridName}`);
	}

	useEffect(() => {
        fetch(`${apiUrl}/showGrids/`)
            .then( response => response.json())
            .then( data => {
                setGrids(data.grids);
            });
        setNumCols(grids.length === 1 ? '1':'2')
    }, [numCols])

    let items = grids.map((gridName, i) => (<Grid key={gridName} gridName={gridName} handleGridClick={handleGridClick} />))


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
      <div className = 'info' style={{width:'max-content'}}><Link to="/create" style={{fontSize:'14pt', color:'#060e4e', backgroundColor: '#f0f7fd'}}> Create new Grid! </Link></div>
        <div style={{marginLeft:'42%', marginTop:'1%'}}>
        <Trash className='Trash'
        onDrop={
        (evt) => {
            fetch(`${apiUrl}/showGrids/`)
            .then( response => response.json())
            .then( data => {
                setGrids(data.grids);
                setNumCols(grids.length === 1 ? '1':'2')});
                }
       }
       apiUrl={apiUrl}/>
      </div>
      </div>
      <div className = 'info' style={{width:'max-content', marginLeft:'6%'}}><Link to="/changeCorpus" style={{fontSize:'14pt', color:'#060e4e', backgroundColor: '#f0f7fd'}}> Upload or update corpus </Link></div>

      </DndProvider>
  );
}

export default Gallery;