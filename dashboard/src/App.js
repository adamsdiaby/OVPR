import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminManagement from './pages/AdminManagement/AdminManagement';
import PendingApproval from './pages/PendingApproval/PendingApproval';
import LawEnforcementDashboard from './pages/LawEnforcement/LawEnforcementDashboard';
import ChatPage from './pages/Chat/ChatPage';
import Layout from './components/Layout/Layout';
import { ChatProvider } from './contexts/ChatContext';

// Composant de route privée
const PrivateRoute = ({ children, roles = [] }) => {
  const isAuthenticated = localStorage.getItem('adminToken');
  const userRole = localStorage.getItem('adminRole');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <ChatProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          
          {/* Routes protégées */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin-management"
            element={
              <PrivateRoute roles={['super_admin', 'admin']}>
                <Layout>
                  <AdminManagement />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/law-enforcement"
            element={
              <PrivateRoute roles={['police', 'gendarmerie']}>
                <Layout>
                  <LawEnforcementDashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <Layout>
                  <ChatPage />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Route par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ChatProvider>
    </Router>
  );
};

export default App;
