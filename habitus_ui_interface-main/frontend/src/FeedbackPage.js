import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Link } from "react-router-dom";



function FeedbackPage({apiUrl}) {


	  return (
      <DndProvider backend={HTML5Backend}>

      <Link to="/thanks">Click here to submit your feedback. </Link>
    
      </DndProvider>
  );
}

export default FeedbackPage;




