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
    <Route path="/" element={<Gallery apiurl="." />}/>
    <Route path="/create" element={<CreatePage apiurl="." />}/>
    <Route path="/changeCorpus" element={<ChangeCorpus apiurl="." />}/>
    <Route path="/grid" element={<App apiurl="."/>}/>
  </Routes>
  </BrowserRouter>
  </React.StrictMode>
);