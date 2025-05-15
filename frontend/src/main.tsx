import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css'; // Assuming you have Tailwind CSS base styles here

import { Amplify } from 'aws-amplify';
// Adjust the path to amplify_outputs.json if it's not in the root
import outputs from '../../amplify_outputs.json'; // Adjust path as necessary

// Configure Amplify for your frontend
Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
