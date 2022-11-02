import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Link } from "react-router-dom";



function QuestionPage({apiUrl}) {


	  return (
      <DndProvider backend={HTML5Backend}>

      <Link to="/feedback">Click here to submit your answers and move to the next page</Link>
    
      </DndProvider>
  );
}

export default QuestionPage;




