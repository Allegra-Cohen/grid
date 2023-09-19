import { useState } from "react";
import App from '../../App';
import '../info.css';
import { useNavigate } from 'react-router-dom'
import { Button } from "../../components";

function Thanks() {
  const navigate = useNavigate()

  return (
    <div style={{ fontSize: 24 }}>
      <div className='container'>
        <div className="image">
          <img src="/grid_logo.png" alt="Descrição da imagem" />
          The Grid Tutorial
        </div>
        Thank you for participating!  
        <Button label="Go to Gallery" color="blue" icon="material-symbols:grid-on" onClick={() => navigate('/')}/>
      </div>
    </div>
  )
}

export default Thanks;

