import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {useId, useEffect, useState} from "react";
import { Link } from "react-router-dom";
import App from './App';
import './info.css';


function ConsentPage({apiUrl}) {

    const [disabled, setDisabled] = useState(true);

    const handleConsentClick = (consent) => {
        if (consent){
            fetch(`${apiUrl}/recordConsent/`).then( response => response.json());
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    }

     return (
      <DndProvider backend={HTML5Backend}>
      <div>

      <div><div className = 'info' style={{width: 'max-content', marginLeft:'200px', marginTop:'60px'}}>Hello! Thank you for participating in this study! First we need to get your informed consent to continue. <br/><br/> Please read the following information. </div>

      <div style={{width: '80%', marginLeft:'200px', marginTop:'30px'}}>

      Thank you for spending time with me today. I am a researcher from the University of Florida conducting research on a new tool for curating knowledge. I would like you to use this tool to organize a collection of information, and then answer some questions about that information. If you agree to participate, the activities will take about an hour. I will not ask your name or any information that identifies you. Your identity will be kept confidential to the extent provided by the law. There are no known risks or direct benefits associated with participating in these activities. Compensation will be a five dollar Starbucks gift card. You do not have to participate if you do not want to. If you do participate, you do not have to answer any question that you do not want to answer, and you may stop participating at any time without any consequence. If you choose to withdraw from the activities, I will terminate the activities. You may ask me questions at any time about this research. Please note that I may benefit professionally if the results of this study are presented at meetings or in scientific journals. If I write a report or article about this research project, your identity will be protected to the maximum extent possible. This project is funded by the U.S. Defense Advanced Research Projects Agency (DARPA). Representatives of the Under Secretary of Defense (Personnel & Readiness) are authorized to review research records as part of their responsibility to protect human research volunteers. Your information may be shared with representatives of the University of Florida or governmental authorities if you or someone else is in danger, or if I am required to do so by law. Also, complete confidentiality cannot be guaranteed because officials of the U.S. Army Human Research Protections Program are permitted by law to inspect the records obtained in this study to ensure compliance with laws and regulations covering research involving human subjects. I will give you an electronic copy of the consent form and my contact information so that you can contact me with questions at a later time if you wish. If you wish to discuss the information above or any discomforts you may experience, please ask questions now or contact me via the contact information on your copy of this form. If you have any questions regarding your rights as a research subject, please contact the Institutional Review Board (IRB02) office (University of Florida; PO Box 100173; Gainesville, FL 32610; (352) 392-0433 or irb2@ufl.edu. <br/> <br/> Researcher contact information: Dr. Allegra Cohen -- aa.cohen@ufl.edu

      </div>

      <div className = 'info' style={{width: 'max-content', marginLeft:'200px', marginTop:'60px'}}> Do you voluntarily consent to participate in this study? If so, please mark "Yes" and continue on to the next page. If not, you may exit the browser window.</div>

      <div> <input className="checkbox" type = 'checkbox' id = "consent"/> <label for="consent" style={{marginLeft:'300px', marginTop:'10px'}} onClick = {() => handleConsentClick(true)}> Yes, I voluntarily consent to participate in this study. </label></div>
      <div> <input className="checkbox" type = 'checkbox' id = "notConsent"/> <label for="notConsent" style={{marginLeft:'300px', marginTop:'10px'}} onClick = {() => handleConsentClick(false)}> No, I do not consent and will exit the browser window. </label></div>

       <Link to="/survey" className="info" style= {disabled ? {pointerEvents: "none", opacity: "0.4", marginLeft:"70%"} : {marginLeft:"70%"}}>Click here to move to the next page.</Link> 

      </div>
      </div>
    
      </DndProvider>
  );
}

export default ConsentPage;

