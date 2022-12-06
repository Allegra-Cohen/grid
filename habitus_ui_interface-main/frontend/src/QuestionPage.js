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
    const [start, setStart] = useState(Date.now());
    const [userID, setUserID] = useState(JSON.parse(localStorage.getItem('userID')));
    const [openAnswers, setOpenAnswers] = useState({});
    const [noQuestionsLeft, setNoQuestionsLeft] = useState(false);

    function toHex(string) {
        var array = [];
        for (var i = 0; i < string.length; i++)
            array[i] = ("000" + string.charCodeAt(i).toString(16)).slice(-4);
        return array.join("");
    }

    function makeMeTwoDigits(n){
        return (n < 10 ? "0" : "") + n;
    }

    const timer = ({ hours, minutes, seconds, completed }) => {
      if (completed || disabled) {
        setDisabled(true);
        return "Done!";
      } else {
        return <span>{makeMeTwoDigits(minutes)}:{makeMeTwoDigits(seconds)}</span>;
      }
    };

    useEffect(() => {
        let user = JSON.parse(localStorage.getItem('userID'));
        setUserID(user);
        fetch(`${apiUrl}/data/${userID}`)
            .then( response => response.json())
            .then( data => {
                setQuestions([...data['question_sets'][questionSet]['listDict']]);
            });
    }, [userID])


    const handleOpenAnswerTyping = (questionIndex, answerText) => {
        setOpenAnswers(openAnswers => ({...openAnswers,[questionIndex]: answerText}));
    }

    const handleAnswerOptionClick = (questionIndex, answerText) => {
        let hexAnswerText = toHex(answerText);
        let url = `${apiUrl}/answerQuestion/${questionSet}/${questionIndex}/${hexAnswerText}/${userID}`

        fetch(url)
            .then( response => response.json())
            .then( data => {
                if (data instanceof Array) {
                    setClicked(data[0]);
                    setNoQuestionsLeft(data[1]);
                } else {
                    setClicked([]);
                }
            });
    };

    const handleLinkClick = () => {
        if (openAnswers){
            Object.keys(openAnswers).forEach(function(key, index) {handleAnswerOptionClick(key, openAnswers[key])} );
        }
        fetch(`${apiUrl}/recordAnswers/${questionSet}/${userID}`);
        setClicked([]);
    }

     return (
      <DndProvider backend={HTML5Backend}>
      {questionSet === 'test' ?
      <div className="info" style={{marginLeft:'84%'}}>
      Time left: <Countdown date={start + timeLimit} renderer={timer} /> <br/>
      <Link to="/instructions3" style={((noQuestionsLeft | disabled) | questionSet !== 'test') ? {}: {pointerEvents: "none", opacity: "0.4"}} onClick = {() => handleLinkClick()}>Done? Move on to the next page.</Link>
      </div>
        : <div/>}
      {questionSet === 'survey' ? <div className = 'info' style = {{width: 'max-content', marginTop:'1%', marginLeft:'1%', fontSize:'14pt'}}> Please answer these questions about your professional background: </div> : <div/>}
      {questionSet === 'feedback' ? <div className = 'info' style = {{width: 'max-content', marginTop:'1%', marginLeft:'1%', fontSize:'14pt'}}> Please answer the questions below about your experience using the Grid: </div> : <div/>}
      {questionSet === 'test' ? <div style={disabled ? {pointerEvents: "none", opacity: "0.4"}:{}}><App apiUrl="." edit={false} training={false} timeLimitGrid={timeLimit}/></div>: <div/>}
      <div className='question-section' style = {disabled ? {pointerEvents: "none", opacity: "0.4", marginTop:'1%', marginLeft:'1.2%', fontSize:'12pt'} : {marginTop:'1%', marginLeft:'1.2%', fontSize:'12pt'}}>
            <ul className='question-content' style={{columns: questionSet === 'test' ? 2 : 1}}> {questions.map((question, i) => (
                <div style={{marginBottom:'3%'}} className = 'keep_together'>
                <div>{question.questionText}</div>
                {question.questionType === 'open_answer' ? <div><textarea maxlength='2500' style={{width:'50%', height:'10em', marginTop:'1%'}} onKeyUp={(evt) => handleOpenAnswerTyping(i, evt.target.value)}/></div>
                :
                <ul className='answer-section'>
                        {question.answerOptions.map((answerOption, j) => (
                            <div>
                            {answerOption.answerText === "d. Other" ? <li style ={{background:'white'}}><textarea maxlength='2500' placeholder="Other" onChange={(evt) => handleOpenAnswerTyping(i, evt.target.value)}/></li>
                            : <li style ={{background:'white'}}><button style={{textAlign:'left', width:'max-content', fontSize: '12pt', background: clicked.includes("" + i + answerOption.answerText) ? '#f0f799' : 'white' }} onClick={() => handleAnswerOptionClick(i, answerOption.answerText)}>{answerOption.answerText}</button></li>
                            }
                            </div>
                        ))}
                </ul>
                }
                </div>
                ))}
            </ul>
       </div>
      <div style = {{marginBottom:'10%'}}>
      {questionSet === 'survey' ? <Link to="/instructions" className="info" style={((noQuestionsLeft | disabled) | questionSet !== 'test') ? {marginLeft:'80%', fontSize:'16pt'}: {pointerEvents: "none", opacity: "0.4", marginLeft:'80%', fontSize:'16pt'}} onClick = {() => handleLinkClick()}> Click here to move on. </Link> : <div/>}
      {questionSet === 'test' ? <Link to="/instructions3" className="info" style={((noQuestionsLeft | disabled) | questionSet !== 'test') ? {marginLeft:'80%', fontSize:'16pt'}: {pointerEvents: "none", opacity: "0.4", marginLeft:'80%', fontSize:'16pt'}} onClick = {() => handleLinkClick()}> Click here to move on. </Link> : <div/>}
      {questionSet === 'feedback' ? <Link to="/thanks" className="info" style={((noQuestionsLeft | disabled) | questionSet !== 'test') ? {marginLeft:'80%', fontSize:'16pt'}: {pointerEvents: "none", opacity: "0.4", marginLeft:'70%', fontSize:'16pt'}} onClick = {() => handleLinkClick()}> Click here to submit your feedback. </Link> : <div/>}
      </div>
    
      </DndProvider>
  );
}

export default QuestionPage;

