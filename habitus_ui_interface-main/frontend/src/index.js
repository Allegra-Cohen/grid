import React from 'react';
import ReactDOM from 'react-dom/client';
import { Route, Routes, HashRouter } from "react-router-dom";
import { Gallery, ChangeCorpus, CreateCorpus, GridPage, TrainingPage } from './pages';
import 'index.css';
import SplashScreen from 'SplashScreen';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<SplashScreen apiurl="http://127.0.0.1:8000" />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/create" element={<CreateCorpus />} />
        <Route path="/changeCorpus" element={<ChangeCorpus />} />
        <Route path="/grid" element={<GridPage />} />
        <Route path="/tutorial/training1" element={<TrainingPage step={1} />} />
        <Route path="/tutorial/training2" element={<TrainingPage step={2} />} />
        <Route path="/tutorial/training3" element={<TrainingPage step={3} />} />
        <Route path="/tutorial/training4" element={<TrainingPage step={4} />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);