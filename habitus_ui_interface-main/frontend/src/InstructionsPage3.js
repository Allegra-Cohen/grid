import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {useId, useEffect, useState} from "react";
import { Link } from "react-router-dom";
import './info.css';


function InstructionsPage3({apiUrl}) {

     return (
      <DndProvider backend={HTML5Backend}>

      <div>
      <div style={{marginLeft:'10%', marginTop:'5%', width: '70%'}} className='info'>
      <br/>Great job! On the next page, you will be asked to give feedback on the Grid tool.
      <br/><br/>
      </div>
      <div>
      <Link to="/feedback" className="info" style={{marginLeft:'60%', marginTop:'5%'}}>Give feedback!</Link>
      </div>
      </div>

	  </DndProvider>
     );

}

export default InstructionsPage3;