import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {useId, useEffect, useState} from "react";
import { Link } from "react-router-dom";
import './info.css';


function InstructionsPage2({apiUrl}) {

	const handleToTest = () => {
	        fetch(`${apiUrl}/loadTestGrid/${JSON.parse(localStorage.getItem('userID'))}`).then( response => response.json());
	    }

     return (
      <DndProvider backend={HTML5Backend}>

      <div>
      <div style={{marginLeft:'10%', marginTop:'5%', width: '70%'}} className='info'>
      Next you will use your Grid to answer some questions about the corpus. You will have 10 minutes to answer all the questions. Please do not guess answers. If you don't know the answer, please select "Don't know."
      </div>
      <div>
      <Link to="/test" className="info" style={{marginLeft:'60%', marginTop:'40px'}} onClick = {() => handleToTest()}>Click here to begin.</Link>
      </div>
      </div>

	  </DndProvider>
     );

}

export default InstructionsPage2;