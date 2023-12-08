import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toQuery } from "services"
import { Header, Button } from 'components'
import { fetchDataFromApi } from 'services'
import { useNavigate } from "react-router-dom"
import './styles.css'

function Gallery() {

  const navigate = useNavigate()
  const [grids, setGrids] = useState([])

  const handleGridClick = (gridName) => {

    let query = toQuery([["text", gridName]])
    fetchDataFromApi(`/loadGrid/${query}`)
    navigate('/tutorial/training1')
  }

  useEffect(() => {
    fetchDataFromApi(`/showGrids/`)
      .then(data => {
        setGrids(data.grids.filter(e => e != 'example'))
      })
  }, [])

  return (
    <>
      <Header>
        <div >
          Gallery
        </div>
        <div className="align-horizontal">
          <Button
            label="Tutorial"
            color="darkBlue"
            icon="fluent:learning-app-20-regular"
            onClick={() => handleGridClick('example')}
          />
          <Button
            label="Upload or Update Corpus"
            color="blue" icon="solar:upload-outline"
            onClick={() => navigate('/changeCorpus')}
          />
          <Button
            label="Create New Grid"
            color="green"
            icon="ic:round-plus"
            onClick={() => navigate('/create')}
          />
        </div>
      </Header>
      <div className='list'>
        {grids && grids.map(e => {
          return (
            <Link to="/grid" style={{ textDecoration: "none" }} onClick={() => handleGridClick(e)}>
              <div className="card" >
                <div className="fileNameGallery">{e}</div>
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
  )
}

export default Gallery