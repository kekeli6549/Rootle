import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // <--- Make sure this path is correct! If you renamed to App.jsx, it should be './App.jsx'
// import './index.css'; // You can uncomment this line if you have a global CSS file

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);