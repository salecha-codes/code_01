import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './styles.css';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <App />
        <Toaster theme="dark" position="bottom-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
