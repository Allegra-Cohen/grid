import React from 'react';
import {createRoot, ReactDOM} from 'react-dom/client';
import './index.css';
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import QuestionPage from './QuestionPage';
import './QuestionPage.css';
import ConsentPage from './ConsentPage';
import App from './App';
import './info.css';


const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
const timeLimitGrid = 2100000;
const timeLimitTest = 600000;

root.render(
  <React.StrictMode>
  <BrowserRouter>
  <Routes>
    <Route path="/" element={<ConsentPage apiUrl="http://localhost:8000" />}/>
    <Route path="/survey" element={<QuestionPage apiUrl="http://localhost:8000" questionSet = 'survey'/>}/>
    <Route path="/instructions" element={<div><div style={{marginLeft:'200px', marginTop:'60px', width: '1200px'}} className='info'>Today you will be working with a corpus of expert knowledge about rice harvesting in the Senegal River Valley. You will have 45 minutes to organize the expert knowledge using the Grid tool. When you are done, you will be tested on the important concepts in this corpus, so please organize your Grid in such a way that you can find information quickly. If you are finished organizing your Grid before your 45 minutes are up, you may move on to the next page to answer questions about the corpus. When you move on, your Grid will appear on the next page but you will not be allowed to edit it or return to the editing page.</div><div><Link to="/grid" className="info" style={{marginLeft:'60%', marginTop:'40px'}}>Click here to begin.</Link></div></div>}/>
    <Route path="/grid" element={<App apiUrl="http://localhost:8000" edit={true} timeLimit={timeLimitGrid}/>}/>
    <Route path="/instructions2" element={<div><div style={{marginLeft:'200px', marginTop:'60px', width: '1200px'}} className='info'>Next you will use your Grid to answer some questions about the corpus. You will have 10 minutes to answer all the questions. Please do not guess answers. If you don't know the answer, please select "Don't know."</div><div><Link to="/test" className="info" style={{marginLeft:'60%', marginTop:'40px'}}>Click here to begin.</Link></div></div>}/>
    <Route path="/test" element={<QuestionPage apiUrl="http://localhost:8000" questionSet = 'test' timeLimit={timeLimitTest}/>}/>
    <Route path="/feedback" element={<QuestionPage apiUrl="http://localhost:8000" questionSet = 'feedback' />}/>
    <Route path="/thanks" element=<div className='info' style={{width:'max-content', marginLeft:'35%', marginTop:'25%', fontSize:'40px'}}>Thank you for participating!</div>/>
  </Routes>
  </BrowserRouter>
  </React.StrictMode>,
);