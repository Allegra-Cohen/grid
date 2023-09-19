import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Gallery from './Gallery';
import CreatePage from './CreatePage';
import ChangeCorpus from './ChangeCorpus';
import App from './App';
import { App2, LoginPage, ConsentPage, TrainingPage, QuestionPage, InstructionsPage, InstructionsPage2, InstructionsPage3, PretrainingPage } from './Tutorial';
import Thanks from './Tutorial/Thanks';

const root = ReactDOM.createRoot(document.getElementById('root'));

const timeLimitGrid = 2100000 + 5000;
const timeLimitTest = 600000 + 5000;

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/changeCorpus" element={<ChangeCorpus />} />
        <Route path="/grid" element={<App />} />
        <Route path="/tutorial/training1" element={<TrainingPage step={1} />} />
        <Route path="/tutorial/training2" element={<TrainingPage step={2} />} />
        <Route path="/tutorial/training3" element={<TrainingPage step={3} />} />
        <Route path="/tutorial/training4" element={<TrainingPage step={4} />} />
        <Route path="/tutorial/survey" element={<QuestionPage questionSet='survey' />} />
        <Route path="/tutorial/instructions" element={<InstructionsPage />} />
        <Route path="/tutorial/grid" element={<App edit={true} training={false} timeLimit={timeLimitGrid} />} />
        <Route path="/tutorial/instructions2" element={<InstructionsPage2 />} />
        <Route path="/tutorial/test" element={<QuestionPage questionSet='test' timeLimit={timeLimitTest} />} />
        <Route path="/tutorial/instructions3" element={<InstructionsPage3 />} />
        <Route path="/tutorial/feedback" element={<QuestionPage questionSet='feedback' />} />
        <Route path="/tutorial/thanks" element={<Thanks />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);