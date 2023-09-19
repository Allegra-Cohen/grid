import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useId, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import './info.css';
import { Button } from '../components';
import { useNavigate } from 'react-router-dom';

function InstructionsPage2({ apiUrl }) {

    const navigate = useNavigate()

    const handleToTest = () => {
        navigate('/tutorial/test')
        fetch(`${apiUrl}/loadTestGrid/${JSON.parse(localStorage.getItem('userID'))}`).then(response => response.json());
    }

    return (
        <div className='container'>
            <div className="loginPageCard">
                Next you will use your Grid to answer some questions about the corpus. You will have 10 minutes to answer all the questions. Please do not guess answers. If you don't know the answer, please select "Don't know."
                
                <Button color="blue" label="Click here to begin" icon="mi:next" onClick={() => handleToTest()} />

            </div>
        </div>
    );

}

export default InstructionsPage2;