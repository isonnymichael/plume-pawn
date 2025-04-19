import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThirdwebProvider } from "thirdweb/react";
import App from './App';
import '../src/assets/css/fonts.css';
import '../src/assets/css/tailwind.css';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThirdwebProvider>
        <App />
      </ThirdwebProvider>
    </BrowserRouter>
  </React.StrictMode>
);