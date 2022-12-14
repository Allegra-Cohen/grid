import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import Gallery from './Gallery';
import CreatePage from './CreatePage';
import ChangeCorpus from './ChangeCorpus';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
  <BrowserRouter>
  <Routes>
    <Route path="/" element={<Gallery apiUrl="." />}/>
    <Route path="/create" element={<CreatePage apiUrl="." />}/>
    <Route path="/changeCorpus" element={<ChangeCorpus apiUrl="." />}/>
    <Route path="/grid" element={<App apiUrl="."/>}/>
  </Routes>
  </BrowserRouter>
  </React.StrictMode>
);