import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Annonces from './pages/Annonces/Annonces';
import Signalements from './pages/Signalements/Signalements';
import Statistiques from './pages/Statistiques/Statistiques';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminToken');
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

// Placeholder components for remaining routes
const Utilisateurs = () => <div>Utilisateurs Content</div>;
const Configuration = () => <div>Configuration Content</div>;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/annonces"
            element={
              <ProtectedRoute>
                <Layout>
                  <Annonces />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/signalements"
            element={
              <ProtectedRoute>
                <Layout>
                  <Signalements />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/utilisateurs"
            element={
              <ProtectedRoute>
                <Layout>
                  <Utilisateurs />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/statistiques"
            element={
              <ProtectedRoute>
                <Layout>
                  <Statistiques />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/configuration"
            element={
              <ProtectedRoute>
                <Layout>
                  <Configuration />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
