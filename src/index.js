import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './styles.scss';

console.log('[index.js] rendering main app');

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
