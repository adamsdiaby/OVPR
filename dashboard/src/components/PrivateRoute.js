import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Vous pouvez retourner un composant de chargement ici
    return <div>Chargement...</div>;
  }

  if (!user) {
    // Rediriger vers la page de connexion en conservant l'URL cible
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.status === 'en_attente') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Rediriger vers le tableau de bord par défaut si le rôle ne correspond pas
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
