import {useEffect, useState} from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Link } from "react-router-dom";
import './info.css';


function LoginPage({apiUrl}) {

	const [valid, setValid] = useState('init');
	const [userID, setUserID] = useState();

	const handleTyping = (evt) => {
		setUserID(evt.target.value.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,""));
	}

	const handleClick = (evt) => {
		if (userID) {
			fetch(`${apiUrl}/setUser/${userID}`)
			.then(response => response.json())
			.then(data => {
					setValid(data);
					console.log(valid);
					console.log(data)
			})
		}
		localStorage.setItem('userID', JSON.stringify(userID));
	}

	  return (
	  <DndProvider backend={HTML5Backend}>

	  <div className = 'info' style={{'marginLeft':'40%', 'width':'max-content', 'marginTop':'4%', 'fontSize':'14pt'}}>
      <label>
        <p>Please enter the code you were given:</p>
        <input type="text" style={{'fontSize':'14pt','marginLeft':'8%'}} onKeyUp = {(evt) => handleTyping(evt)}/>
      </label>
      <div>
        <button type="submit" style={{'fontSize':'14pt', 'marginLeft':'35%'}} onClick = {(evt) => handleClick(evt)}>Submit</button>
      </div>
      </div>

      {valid !== 'init' ?
      	<div>{valid ? <div style={{'marginLeft':'39%', 'marginTop':'1%','fontSize':'14pt', 'background': '#d5ffd4', 'width':'max-content', 'padding':'1%'}}><Link to="/consent"> Thanks! Click here to enter the study website. </Link> </div>
      	:
      	<div style={{'marginLeft':'30%', 'marginTop':'1%','fontSize':'14pt', 'background': '#ffdbd1', 'width':'max-content', 'padding':'1%'}}>We don't have a record of that code. Please check whether it is correct, and if so, contact us.</div>}</div>
      : <div/>}

	  </DndProvider>
  );
}

export default LoginPage;