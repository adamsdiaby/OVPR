import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

function HomePage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <img
        src="/logoovpr.png"
        alt="Logo OVPR"
        style={{ width: '200px', marginBottom: '20px' }}
      />
      <h1>Bienvenue sur OVPR</h1>
      <p>La plateforme pour retrouver vos objets volés, perdus ou retrouvés.</p>
      <Link to="/start">
        <button
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          Commencer
        </button>
      </Link>
    </div>
  );
}

function StartPage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Page de démarrage</h1>
      <p>Ceci est la page vers laquelle le bouton "Commencer" redirige.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/start" element={<StartPage />} />
      </Routes>
    </Router>
  );
}

export default App;
