import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toQuery } from "services"
import { Header, Button } from 'components'
import { fetchDataFromApi } from 'services'
import { useNavigate } from "react-router-dom"
import './styles.css'
import axios from "axios"

function Gallery() {

  const navigate = useNavigate()
  const [grids, setGrids] = useState([])
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleGridClick = (gridName) => {

    let query = toQuery([["text", gridName]])
    fetchDataFromApi(`/loadGrid/${query}`)
    navigate('/tutorial/training1')
  }

  useEffect(() => {

    const fetchData = async () => {
      

      const username = 'arthur';
      const password = 'mpSDY2FrD8kMSCPVYATw';
      const url = 'https://elasticsearch.habitus.clulab.org/habitus3/_search';

      fetch(url, {
        method: 'POST', // ou 'POST', 'PUT', etc., dependendo do tipo de requisição que você precisa fazer
        headers: {
          'Authorization': 'Basic ' + btoa(username + ':' + password),
          'Content-Type': 'application/json', // Se necessário, ajuste o tipo de conteúdo conforme sua necessidade
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Erro ao fazer requisição');
          }
          return response.json(); // ou response.text(), dependendo do tipo de resposta esperada
        })
        .then(data => {
          // Faça algo com os dados retornados
        })
        .catch(error => {
          console.error('Erro:', error);
        });

    };
    fetchData();
  }, []);

  console.log(data)

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