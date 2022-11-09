import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {useId, useEffect, useState} from "react";
import { Link } from "react-router-dom";
import App from './App';
import './info.css';
import Countdown from 'react-countdown';


function QuestionPage({apiUrl, questionSet, timeLimit}) {

    const queryString = require('query-string');
    const [questions, setQuestions] = useState([]);
    const [clicked, setClicked] = useState([]);
    const [disabled, setDisabled] = useState(false);

    const timer = ({ hours, minutes, seconds, completed }) => {
      if (completed || disabled) {
        setDisabled(true);
        return "Done!";
      } else {
        return <span>{minutes}:{seconds}</span>;
      }
    };

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
      {questionSet === 'test' ?
      <div className="info" style={{marginLeft:'84%'}}>
      Time left: <Countdown date={Date.now() + timeLimit} renderer={timer} /> <br/>
      <Link to="/feedback" onClick = {() => handleLinkClick()}>Done? Move on to the next page.</Link>
      </div>
        : <div/>}
      {questionSet === 'survey' ? <div className = 'info' style = {{width: 'max-content', marginTop:'10px', marginLeft:'10px', fontSize:'14pt'}}> Please answer these questions about your professional background: </div> : <div/>}
      {questionSet === 'feedback' ? <div className = 'info' style = {{width: 'max-content', marginTop:'10px', marginLeft:'10px', fontSize:'14pt'}}> Please answer the questions below about your experience using the Grid: </div> : <div/>}
      {questionSet === 'test' ? <div style={disabled ? {pointerEvents: "none", opacity: "0.4"}:{}}><App apiUrl="http://localhost:8000" edit={false} timeLimitGrid={timeLimit}/></div>: <div/>}
      <div className='question-section' style = {disabled ? {pointerEvents: "none", opacity: "0.4", marginTop:'10px', marginLeft:'30px', fontSize:'12pt'} : {marginTop:'10px', marginLeft:'30px', fontSize:'12pt'}}>
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
      <div style = {{marginBottom:'200px'}}>
      {questionSet === 'survey' ? <Link to="/instructions" className="info" style={{marginLeft:'80%', fontSize:'16pt'}} onClick = {() => handleLinkClick()}> Click here to move on. </Link> : <div/>}
      {questionSet === 'test' ? <Link to="/feedback" className="info" style={{marginLeft:'80%', fontSize:'16pt'}} onClick = {() => handleLinkClick()}> Click here to move on. </Link> : <div/>}
      {questionSet === 'feedback' ? <Link to="/thanks" className="info" style={{marginLeft:'80%', fontSize:'16pt'}} onClick = {() => handleLinkClick()}> Click here to submit your feedback. </Link> : <div/>}
      </div>
    
      </DndProvider>
  );
}

export default QuestionPage;

