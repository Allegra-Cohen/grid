import React from 'react';
import {createRoot, ReactDOM} from 'react-dom/client';
import './index.css';
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import QuestionPage from './QuestionPage';
import './QuestionPage.css';
import App from './App';


const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
  <BrowserRouter>
  <Routes>
    <Route path="/" element={<div style={{marginLeft:'200px', marginTop:'60px', width: '1200px'}}>Hello! Thank you for participating in this study! First we need to get your informed consent to continue. <Link to="/survey">Click here to move to the next page.</Link></div>}/>
    <Route path="/survey" element={<QuestionPage apiUrl="http://localhost:8000" questionSet = 'survey'/>}/>
    <Route path="/instructions" element={<div style={{marginLeft:'200px', marginTop:'60px', width: '1200px'}}>Today you will be working with a corpus of expert knowledge about rice harvesting in the Senegal River Valley. You will have 45 minutes to organize the expert knowledge using the Grid tool. When you are done, you will be tested on the important concepts in this corpus, so please organize your Grid in such a way that you can find information quickly. If you are finished organizing your Grid before your 45 minutes are up, you may move on to the next page to answer questions about the corpus. When you move on, your Grid will appear on the next page but you will not be allowed to edit it or return to the editing page. <Link to="/grid">Click here to begin.</Link></div>}/>
    <Route path="/grid" element={<App apiUrl="http://localhost:8000" edit={true}/>}/>
    <Route path="/test" element={<QuestionPage apiUrl="http://localhost:8000" questionSet = 'test'/>}/>
    <Route path="/feedback" element={<QuestionPage apiUrl="http://localhost:8000" questionSet = 'feedback' />}/>
    <Route path="/thanks" element=<div style={{marginLeft:'35%', marginTop:'25%', fontSize:'40px', color:'teal'}}>Thank you for participating!</div>/>
  </Routes>
  </BrowserRouter>
  </React.StrictMode>,
);