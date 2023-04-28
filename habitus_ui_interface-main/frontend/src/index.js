import App from "./App";
import ChangeBeliefs from "./ChangeBeliefs";
import ChangeCorpus from "./ChangeCorpus";
import CreatePage from "./CreatePage";
import Gallery from "./Gallery";

import {BrowserRouter, Route, Routes} from "react-router-dom";
import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Gallery apiurl="." />}/>
                <Route path="/create" element={<CreatePage apiurl="." />}/>
                <Route path="/changeCorpus" element={<ChangeCorpus apiurl="." />}/>
                <Route path="/changeBeliefs" element={<ChangeBeliefs apiurl="." />}/>
                <Route path="/grid" element={<App apiurl="."/>}/>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);