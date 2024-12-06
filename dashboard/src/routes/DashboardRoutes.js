import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import AllUsers from '../pages/users/AllUsers';
import RolesPermissions from '../pages/users/RolesPermissions';
import Suspensions from '../pages/users/Suspensions';
import AccountsList from '../pages/police/AccountsList';
import Correspondence from '../pages/police/Correspondence';
import Verifications from '../pages/police/Verifications';
import { useAuth } from '../contexts/AuthContext';

const DashboardRoutes = () => {
  const { user } = useAuth();

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {/* Routes administrateur */}
      <Route path="/admin" element={<Dashboard />} />
      
      {/* Routes de gestion des utilisateurs */}
      <Route path="/admin/users" element={<AllUsers />} />
      <Route path="/admin/users/roles" element={<RolesPermissions />} />
      <Route path="/admin/users/suspended" element={<Suspensions />} />
      
      {/* Routes Police/Gendarmerie */}
      <Route path="/admin/police/accounts" element={<AccountsList />} />
      <Route path="/admin/police/correspondence" element={<Correspondence />} />
      <Route path="/admin/police/verifications" element={<Verifications />} />

      {/* Route par défaut - redirige vers le tableau de bord admin */}
      <Route
        path="/"
        element={<Navigate to="/admin" replace />}
      />

      {/* Route de repli pour les chemins non trouvés */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default DashboardRoutes;
