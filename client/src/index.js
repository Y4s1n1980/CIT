import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js")
          .then((registration) => {
              console.log("Service Worker registrado:", registration);
          })
          .catch((error) => {
              console.error("Error al registrar el Service Worker:", error);
          });
  });
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);




// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
