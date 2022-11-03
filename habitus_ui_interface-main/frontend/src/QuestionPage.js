import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {useId, useEffect, useState} from "react";
import { Link } from "react-router-dom";
import App from './App';



function QuestionPage({apiUrl, questionSet}) {

    const queryString = require('query-string');
    const [questions, setQuestions] = useState([]);
    const [clicked, setClicked] = useState([]);

    useEffect(() => {
        fetch(`${apiUrl}/data/${true}`)
            .then( response => response.json())
            .then( data => {
                setQuestions(data['question_sets'][questionSet]['listDict']);
                console.log(questions)
            });
    }, [])


    const handleAnswerOptionClick = (questionIndex, answerText) => {
        fetch(`${apiUrl}/answerQuestion/${questionSet}/${questionIndex}/${answerText}`)
            .then( response => response.json())
            .then( data => {
                setClicked(data);
            });
    };

    const handleLinkClick = () => {
        console.log("AAAAAH")
        fetch(`${apiUrl}/recordAnswers/${questionSet}`).then( response => response.json());
        setClicked = []
    }

     return (
      <DndProvider backend={HTML5Backend}>

      {questionSet === 'survey' ? <div style = {{marginTop:'10px', marginLeft:'10px', fontSize:'14pt'}}> Please answer these questions about your professional background: </div> : <div/>}
      {questionSet === 'test' ? <div style = {{marginTop:'10px', marginLeft:'10px', fontSize:'14pt'}}> Please answer the questions below, using your Grid to access information. You will have ten minutes to answer all the questions. Please do not guess answers. If you don’t know the answer, please select 'don’t know.' </div> : <div/>}
      {questionSet === 'feedback' ? <div style = {{marginTop:'10px', marginLeft:'10px', fontSize:'14pt'}}> Please answer the questions below about your experience using the Grid: </div> : <div/>}
      {questionSet === 'test' ? <App apiUrl="http://localhost:8000" edit={false} /> : <div/>}
      <div className='question-section' style = {{marginTop:'10px', marginLeft:'30px', fontSize:'12pt'}}>
            <ul className='question-content' style={{columns: questionSet === 'test' ? 2 : 1}}> {questions.map((question, i) => (
                <div style={{marginBottom:'5em'}}>
                <div>{question.questionText}</div>
                {question.questionType === 'open_answer' ? <div><textarea style={{width:'500px', height:'150px'}} onChange={(evt) => handleAnswerOptionClick(i, evt.target.value)}/></div>
                :
                <ul className='answer-section'>
                        {question.answerOptions.map((answerOption, j) => (
                            <div>
                            {answerOption.answerText === "d. Other" ? <li style ={{background:'white'}}><textarea placeholder="Other" onChange={(evt) => handleAnswerOptionClick(i, evt.target.value)}/></li>
                            : <li style ={{background:'white'}}><button style={{fontSize: '12pt', background: clicked.includes("" + i + answerOption.answerText) ? '#f0f799' : 'white'}} onClick={() => handleAnswerOptionClick(i, answerOption.answerText)}>{answerOption.answerText}</button></li>
                            }
                            </div>
                        ))}
                </ul>
                }
                </div>
                ))}
            </ul>
       </div>
      <div style = {{marginBottom:'500px'}}>
      {questionSet === 'survey' ? <Link to="/instructions" style = {{marginTop:'10px', marginLeft:'90%', background:'pink'}} onClick = {() => handleLinkClick()}> Click here to move on. </Link> : <div/>}
      {questionSet === 'test' ? <Link to="/feedback" style = {{marginTop:'10px', marginLeft:'90%', background:'pink'}} onClick = {() => handleLinkClick()}> Click here to move on. </Link> : <div/>}
      {questionSet === 'feedback' ? <Link to="/thanks" style = {{marginTop:'10px', marginLeft:'80%', background:'pink'}} onClick = {() => handleLinkClick()}> Click here to submit your feedback. </Link> : <div/>}
      </div>
    
      </DndProvider>
  );
}

export default QuestionPage;

