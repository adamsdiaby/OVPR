import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login/Login';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import PendingApproval from './pages/PendingApproval/PendingApproval';
import AnnoncesPage from './pages/Annonces/AnnoncesPage';
import AdminAnnoncesPage from './pages/Admin/Annonces/AdminAnnoncesPage';
import AllAnnonces from './pages/Admin/Annonces/AllAnnonces';
import Signalements from './pages/Admin/Annonces/Signalements';
import NouvellesAnnonces from './pages/Admin/Annonces/NouvellesAnnonces';
import AllUsers from './pages/users/AllUsers';
import RolesPermissions from './pages/users/RolesPermissions';
import Suspensions from './pages/users/Suspensions';
import AccountsList from './pages/police/AccountsList';
import Correspondence from './pages/police/Correspondence';
import Verifications from './pages/police/Verifications';
import Statistics from './pages/tools/Statistics';
import Messages from './pages/tools/Messages';
import History from './pages/tools/History';
import Notifications from './pages/tools/Notifications';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Route publique */}
            <Route path="/login" element={<Login />} />
            
            {/* Route pour les comptes en attente */}
            <Route
              path="/pending-approval"
              element={
                <PrivateRoute>
                  <PendingApproval />
                </PrivateRoute>
              }
            />

            {/* Routes administrateur */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            {/* Routes pour la gestion des utilisateurs */}
            <Route
              path="/admin/users"
              element={
                <PrivateRoute>
                  <AllUsers />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users/roles"
              element={
                <PrivateRoute>
                  <RolesPermissions />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users/suspended"
              element={
                <PrivateRoute>
                  <Suspensions />
                </PrivateRoute>
              }
            />

            {/* Routes Police/Gendarmerie */}
            <Route
              path="/admin/police/accounts"
              element={
                <PrivateRoute>
                  <AccountsList />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/police/correspondence"
              element={
                <PrivateRoute>
                  <Correspondence />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/police/verifications"
              element={
                <PrivateRoute>
                  <Verifications />
                </PrivateRoute>
              }
            />

            {/* Routes OUTILS */}
            <Route
              path="/admin/tools/statistics"
              element={
                <PrivateRoute>
                  <Statistics />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/tools/messages"
              element={
                <PrivateRoute>
                  <Messages />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/tools/history"
              element={
                <PrivateRoute>
                  <History />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/tools/notifications"
              element={
                <PrivateRoute>
                  <Notifications />
                </PrivateRoute>
              }
            />

            {/* Routes pour les annonces */}
            <Route
              path="/admin/annonces/all"
              element={
                <PrivateRoute>
                  <AllAnnonces />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/annonces/reports"
              element={
                <PrivateRoute>
                  <Signalements />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/annonces/new"
              element={
                <PrivateRoute>
                  <NouvellesAnnonces />
                </PrivateRoute>
              }
            />

            {/* Route par défaut - redirige vers le tableau de bord admin */}
            <Route
              path="/"
              element={<Navigate to="/admin/dashboard" replace />}
            />

            {/* Route de repli pour les chemins non trouvés */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
