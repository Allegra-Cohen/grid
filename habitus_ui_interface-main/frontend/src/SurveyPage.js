import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {useId, useEffect, useState} from "react";
import { Link } from "react-router-dom";



function SurveyPage({apiUrl}) {

	const questionSet = 'survey'
	const queryString = require('query-string');
	const [questions, setQuestions] = useState([]);
	const [clicked, setClicked] = useState([]);

	useEffect(() => {
        fetch(`${apiUrl}/data/`)
            .then( response => response.json())
            .then( data => {
                setQuestions(data['question_sets'][questionSet]['listDict']);
            });
    }, [])


	const handleAnswerOptionClick = (questionIndex, answerText) => {
		console.log(questions)
		console.log(questionSet)
		console.log(answerText)
        fetch(`${apiUrl}/answerQuestion/${questionSet}/${questionIndex}/${answerText}`)
            .then( response => response.json())
            .then( data => {
            	console.log(data);
                setClicked(data);
                console.log(clicked)
            });
	};

	const handleLinkClick = () => {
		fetch(`${apiUrl}/recordAnswers/${questionSet}`).then( response => response.json())
	}

	 return (
      <DndProvider backend={HTML5Backend}>


      <div className='question-section'>
			<div className='question-content'> {questions.map((question, i) => (
				<div>
				<div>{question.questionText}</div>
				<div className='answer-section'>
						{question.answerOptions.map((answerOption, j) => (
							<button style={{background: clicked.includes("" + i + answerOption.answerText) ? '#f0f799' : 'white'}} onClick={() => handleAnswerOptionClick(i, answerOption.answerText)}>{answerOption.answerText}</button>
						))}
	  			</div>
	  			</div>
				))}
			</div>
	   </div>


      <Link to="/grid" onClick = {() => handleLinkClick()} >Click here to begin organizing your Grid</Link>
    
      </DndProvider>
  );
}

export default SurveyPage;

