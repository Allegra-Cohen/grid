import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {useId, useEffect, useState} from "react";
import { Link } from "react-router-dom";
import './info.css';


function PretrainingPage({apiUrl}) {

	const handleToTraining = () => {
	        fetch(`${apiUrl}/loadTrainingGrid/`).then( response => response.json());
	    }

     return (
      <DndProvider backend={HTML5Backend}>

      <div>
      <div style={{marginLeft:'30%', marginTop:'5%', width: '30%'}} className='info'>
      Before beginning the study, you will go through a brief training to learn how to use the tool.<br/>
      </div>
      <div>
      <Link to="/training1" className="info" style={{marginLeft:'60%', marginTop:'5%'}} onClick = {() => handleToTraining()}>Click here to begin.</Link>
      </div>
      </div>

	  </DndProvider>
     );

}

export default PretrainingPage;