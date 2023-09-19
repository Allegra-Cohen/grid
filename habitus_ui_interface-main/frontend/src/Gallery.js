import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toQuery } from "./toEncoding";
import { Header, Button } from './components';
import "./index.css";
import "./Gallery.css";
import './info.css';
import { fetchDataFromApi } from './services'

function Gallery() {

    const [grids, setGrids] = useState([]);

    const handleGridClick = (gridName) => {
        console.log(gridName)
        let query = toQuery([["text", gridName]]);
        fetchDataFromApi(`/loadGrid/${query}`);
    }

    useEffect(() => {
        fetchDataFromApi(`/showGrids/`)
            .then(data => {
                setGrids(data.grids);
            });
    }, [])


    return (
        <>
            <Header>
                <div className="leftContent">
                    Gallery
                </div>
                <div className="rightContent">
                    <Link to="/tutorial/training1" style={{ textDecoration: 'none' }}>
                        <Button label="Tutorial" color="darkBlue" icon="fluent:learning-app-20-regular" onClick={() => handleGridClick('example')} />
                    </Link>
                    <Link to="/changeCorpus" style={{ textDecoration: 'none' }}>
                        <Button label="Upload or Update Corpus" color="blue" icon="solar:upload-outline" />
                    </Link>
                    <Link to="/create" style={{ textDecoration: 'none' }}>
                        <Button label="Create New Grid" color="green" icon="ic:round-plus" />
                    </Link>

                </div>
            </Header>
            <div className='list'>
                {grids && grids.map(e => {
                    return (
                        <Link to="/grid" style={{ textDecoration: "none" }} onClick={() => handleGridClick(e)}>
                            <div className="card" >
                                <div>{e}</div>
                                <div className="go-corner">
                                    <div className="go-arrow">
                                        →
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </>
    );
}

export default Gallery;