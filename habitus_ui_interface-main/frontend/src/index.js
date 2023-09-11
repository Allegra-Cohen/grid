import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Gallery from './Gallery';
import CreatePage from './CreatePage';
import ChangeCorpus from './ChangeCorpus';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
  <BrowserRouter>
  <Routes>
    <Route path="/" element={<Gallery apiurl="http://127.0.0.1:8000" />}/>
    <Route path="/create" element={<CreatePage apiurl="http://127.0.0.1:8000" />}/>
    <Route path="/changeCorpus" element={<ChangeCorpus apiurl="http://127.0.0.1:8000" />}/>
    <Route path="/grid" element={<App apiurl="http://127.0.0.1:8000"/>}/>
  </Routes>
  </BrowserRouter>
  </React.StrictMode>
);