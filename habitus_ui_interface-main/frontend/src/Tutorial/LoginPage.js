import { useEffect, useState } from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Link } from "react-router-dom";
import './info.css';
import { Button, Input } from "../components";


function LoginPage({ apiUrl }) {

	const [valid, setValid] = useState('init');
	const [userID, setUserID] = useState();

	const handleTyping = (evt) => {
		setUserID(evt.target.value.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""));
	}

	const handleClick = () => {
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

	console.log('userID', userID)


	return (
		<div className="container">
			<div className="image">
				<img src="/grid_logo.png" alt="Descrição da imagem" />
				The Grid Tutorial
			</div>
			<div className="loginPageCard">
				{
					valid !== 'init' ?
						<div>
							{valid ?
								<div >
									<Link to="/tutorial/consent" style={{ textDecoration: 'none', color: '#2c2c2c'}}> Thanks! Click here to enter the study website. </Link>
								</div>
								:
								<div >
									We don't have a record of that code. Please check whether it is correct, and if so, contact us.
								</div>
							}
						</div>
						:
						<>
							Please enter the code you were given:
							<Input onInput={(evt) => handleTyping(evt)} placeholder="Enter Code" />
							<Button color="green" label="Submit" icon="solar:login-linear" onClick={() => handleClick()} />
						</>
				}
			</div>
		</div >

	);

}

export default LoginPage;