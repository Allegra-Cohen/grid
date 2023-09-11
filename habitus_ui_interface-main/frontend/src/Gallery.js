import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toQuery } from "./toEncoding";
import { Header, Button } from './components';
import "./index.css";
import "./Gallery.css";
import './info.css';

function Gallery({ apiurl }) {

    const [grids, setGrids] = useState([]);

    const handleGridClick = (gridName) => {
        console.log(gridName)
        let query = toQuery([["text", gridName]]);
        fetch(`${apiurl}/loadGrid/${query}`);
    }

    useEffect(() => {
        fetch(`${apiurl}/showGrids/`)
            .then(response => response.json())
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
                            <div class="card" >
                                <div>{e}</div>
                                <div class="go-corner">
                                    <div class="go-arrow">
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