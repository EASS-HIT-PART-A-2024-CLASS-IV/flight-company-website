import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ServiceInjector from './api/service.injector';

new ServiceInjector()

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<App />);