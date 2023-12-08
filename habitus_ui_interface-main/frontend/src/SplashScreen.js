/* eslint-disable jsx-a11y/img-redundant-alt */
import { useEffect, useState } from 'react';
import './SplashScreen.css';
import { Link } from "react-router-dom";

export default function SplashScreen({ apiurl }) {

  const [backendReady, setBackendReady] = useState(false)

  function checkBackendReady() {
    fetch('http://127.0.0.1:8000/backend-ready')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data.message === 'Backend is ready!') {
          // createWindow()
          setBackendReady(true)
        } else {
          // O backend ainda não está pronto, tentar novamente após 1 segundo
          setTimeout(checkBackendReady, 5000);
        }
      })
      .catch((error) => {
        // Tratar erros
        console.error('Error fetching backend status:', error);
        // Tentar novamente após 1 segundo
        setTimeout(checkBackendReady, 5000);
      });
  }

  useEffect(() => {
    checkBackendReady()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div class="container">
      <div class="flex-container">
        <div class="text-container">
          <h1 class="title">Welcome to THE GRID</h1>
          <div class="loading-container">
            {backendReady ?
              <Link to="/gallery">
                <button className="access-button button-appear">
                  Access
                </button>
              </Link>
              :
              <div class="loading-container">
                <div class="loading"></div>
                <h3>Starting the server...</h3>
              </div>
            }
          </div>
        </div>

        <div class="image-container">
          <img src="grid_logo.png" alt="Grid Image" />
        </div>
      </div>
    </div>
  );
}