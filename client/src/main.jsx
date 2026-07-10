import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';

// Enregistrement du Service Worker pour la PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('✅ Service Worker enregistré avec succès:', registration.scope);
      },
      (err) => {
        console.log('❌ Échec enregistrement Service Worker:', err);
      }
    );
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);