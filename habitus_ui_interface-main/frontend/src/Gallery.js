import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {useId, useEffect, useState} from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import './info.css';


function Gallery({apiUrl}) {

	const [grids, setGrids] = useState([]);

	const handleGridClick = (gridName) => {
		console.log(gridName)
		fetch(`${apiUrl}/loadGrid/${gridName}`);
	}

	useEffect(() => {
        fetch(`${apiUrl}/showGrids/`)
            .then( response => response.json())
            .then( data => {
                setGrids(data)
            });
    }, [])


	return (
      <DndProvider backend={HTML5Backend}>
      <h1 style={{'marginLeft':"5%", 'color':'#060e4e'}}>Your Grids:</h1>
      <ul style={{'columns':'2', 'marginLeft':"3.5%"}}>
      {grids.map((gridName, i) => (
         <div className='gallery' key={gridName}><Link to="/grid" style={{'color' : '#060e4e', 'fontSize':'14pt'}} onClick={()=>handleGridClick(gridName)}>{gridName}</Link></div>
      	))
      }

      </ul>

      <div className = 'info' style={{'marginLeft':"6%", 'marginTop':'2%', 'width':'max-content', 'fontSize':'14pt', 'color' : '#060e4e'}}>
      <Link to="/createpage" style={{'fontSize':'14pt', 'color':'#060e4e', 'backgroundColor': '#f0f7fd'}}> Create new Grid! </Link>
      </div>

      </DndProvider>
  );
}

export default Gallery;