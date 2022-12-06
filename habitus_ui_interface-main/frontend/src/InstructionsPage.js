import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {useId, useEffect, useState} from "react";
import { Link } from "react-router-dom";
import './info.css';


function InstructionsPage({apiUrl}) {

	const handleToCuration = () => {
	        fetch(`${apiUrl}/loadCurationGrid/${JSON.parse(localStorage.getItem('userID'))}`).then( response => response.json());
	    }

     return (
      <DndProvider backend={HTML5Backend}>

      <div>
      <div style={{marginLeft:'10%', marginTop:'5%', width: '70%'}} className='info'>
      <br/>Today you will be working with a corpus of expert knowledge about <b>rice harvesting</b> in the Senegal River Valley. 
      You will have 35 minutes to organize the expert knowledge using the Grid tool. When you are done, you will be tested on the important concepts in this corpus, so please organize your Grid in such a way that you can find information quickly. 
      Think about how you would organize information in your own research; <b>the columns of your Grid should contain what you think are the important themes or variables related to rice harvesting.</b>
      <br/><br/>
      If you are finished organizing your Grid before your 35 minutes are up, you may move on to the next page to answer questions about the corpus. When you move on, your Grid will appear on the next page but you will not be allowed to edit it or return to the editing page.
      <br/><br/>
      </div>
      <div>
      <Link to="/grid" className="info" style={{marginLeft:'60%', marginTop:'5%'}} onClick = {() => handleToCuration()}>Click here to begin.</Link>
      </div>
      </div>

	  </DndProvider>
     );

}

export default InstructionsPage;