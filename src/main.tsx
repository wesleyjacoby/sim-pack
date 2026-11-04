import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { initPwa } from './pwa';


initPwa();

createRoot(document.getElementById('root') as HTMLElement).render(<StrictMode><App /></StrictMode>);