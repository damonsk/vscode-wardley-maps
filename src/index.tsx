import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './styles.scss';

// Compatibility for dependencies compiled against classic JSX runtime.
(window as Window & { React?: typeof React }).React = React;

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);
root.render(<App />);
