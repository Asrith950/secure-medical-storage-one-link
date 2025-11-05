import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';

// Configure axios base URL for production deployments (e.g., Render)
// If REACT_APP_API_BASE_URL is set, all relative requests will target that server.
// Example: REACT_APP_API_BASE_URL=https://your-api.onrender.com
const apiBase = process.env.REACT_APP_API_BASE_URL;
if (apiBase) {
  axios.defaults.baseURL = apiBase;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);