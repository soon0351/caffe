import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupAuthUI } from './auth-ui';

setupAuthUI();

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
