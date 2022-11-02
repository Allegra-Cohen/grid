import React from 'react';
import {createRoot, ReactDOM} from 'react-dom/client';
import './index.css';
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import SurveyPage from './SurveyPage';
import QuestionPage from './QuestionPage';
import FeedbackPage from './FeedbackPage';
import App from './App';


const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
  <BrowserRouter>
  <Routes>
    <Route path="/" element={<div>Hello! Thank you for participating in this study! First we need to get your informed consent to continue. <Link to="/survey">Click here to move on.</Link></div>}/>
    <Route path="/survey" element={<SurveyPage apiUrl="http://localhost:8000" />}/>
    <Route path="/grid" element={<App apiUrl="http://localhost:8000" />}/>
    <Route path="/questions" element={<QuestionPage apiUrl="http://localhost:8000" />}/>
    <Route path="/feedback" element={<FeedbackPage apiUrl="http://localhost:8000" />}/>
    <Route path="/thanks" element="Thank you for participating!"/>
  </Routes>
  </BrowserRouter>
  </React.StrictMode>,
);