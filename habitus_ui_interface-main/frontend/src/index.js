import React from 'react';
import {createRoot, ReactDOM} from 'react-dom/client';
import './index.css';
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import QuestionPage from './QuestionPage';
import './QuestionPage.css';
import PretrainingPage from './PretrainingPage';
import TrainingPage from './TrainingPage';
import InstructionsPage from './InstructionsPage';
import InstructionsPage2 from './InstructionsPage2';
import InstructionsPage3 from './InstructionsPage3';
import ConsentPage from './ConsentPage';
import LoginPage from './LoginPage';
import App from './App';
import './info.css';


const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
const timeLimitGrid = 2100000 + 5000;
const timeLimitTest = 600000 + 5000;

root.render(
  <React.StrictMode>
  <BrowserRouter>
  <Routes>
    <Route path="/" element={<LoginPage apiUrl="." />}/>
    <Route path="/consent" element={<ConsentPage apiUrl="." />}/>
    <Route path="/pretraining" element={<PretrainingPage apiUrl="."/>}/>
    <Route path="/training1" element={<TrainingPage step={1} apiUrl="."/>}/>
    <Route path="/training2" element={<TrainingPage step={2} apiUrl="."/>}/>
    <Route path="/training3" element={<TrainingPage step={3} apiUrl="."/>}/>
    <Route path="/training4" element={<TrainingPage step={4} apiUrl="."/>}/>
    <Route path="/survey" element={<QuestionPage apiUrl="." questionSet = 'survey'/>}/>
    <Route path="/instructions" element={<InstructionsPage apiUrl="."/>}/>
    <Route path="/grid" element={<App apiUrl="." edit={true} training={false} timeLimit={timeLimitGrid}/>}/> /* The App link out of curation mode saves the grid, which is then loaded by the link out of instructions2 */
    <Route path="/instructions2" element={<InstructionsPage2 apiUrl="."/>}/>
    <Route path="/test" element={<QuestionPage apiUrl="." questionSet = 'test' timeLimit={timeLimitTest}/>}/>
    <Route path="/instructions3" element={<InstructionsPage3 apiUrl="."/>}/>
    <Route path="/feedback" element={<QuestionPage apiUrl="." questionSet = 'feedback' />}/>
    <Route path="/thanks" element=<div className='info' style={{width:'max-content', marginLeft:'35%', marginTop:'10%', fontSize:'40px'}}>Thank you for participating!</div>/>
  </Routes>
  </BrowserRouter>
  </React.StrictMode>,
);