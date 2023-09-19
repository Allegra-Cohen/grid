import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useId, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import './info.css';
import { Button } from '../components';
import { useNavigate } from 'react-router-dom'


function PretrainingPage({ apiUrl }) {

    const navigate = useNavigate();

    const handleToTraining = () => {
        fetch(`${apiUrl}/loadTrainingGrid/${JSON.parse(localStorage.getItem('userID'))}`).then(response => response.json());
    }

    return (

        <div className='container'>
            <div className="loginPageCard">
                Before beginning the study, you will go through a brief training to learn how to use the tool.
                <Button color="blue" label="Click Here to Begin" icon="mi:next" onClick={() => navigate("/tutorial/training1")} />
            </div>

        </div>


    );

}

export default PretrainingPage;