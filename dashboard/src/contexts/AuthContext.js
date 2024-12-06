import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_ENDPOINTS, { createApiClient } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const verificationInProgress = useRef(false);
    const verificationTimer = useRef(null);

    const login = async (credentials) => {
        try {
            setError(null);
            console.log('Tentative de connexion avec:', credentials);
            
            const apiClient = createApiClient();
            const { token, admin } = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
            
            console.log('Réponse de connexion:', { token, admin });
            
            if (!token || !admin) {
                throw new Error('Réponse de connexion invalide');
            }

            localStorage.setItem('token', token);
            setUser(admin);

            // Redirection basée sur le rôle/statut
            if (admin.status === 'en_attente') {
                navigate('/pending-approval');
            } else if (admin.role === 'super_admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }

            return true;
        } catch (err) {
            console.error('Erreur de connexion:', err);
            setError(err.message || 'Erreur lors de la connexion');
            return false;
        }
    };

    const logout = useCallback(() => {
        if (verificationTimer.current) {
            clearTimeout(verificationTimer.current);
            verificationTimer.current = null;
        }
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
        navigate('/login');
    }, [navigate]);

    const verifyToken = useCallback(async () => {
        // Si déjà en train de vérifier ou sur la page de login sans token, ne rien faire
        if (verificationInProgress.current) return;
        
        const token = localStorage.getItem('token');
        if (location.pathname === '/login' && !token) {
            setLoading(false);
            return;
        }

        if (!token) {
            setLoading(false);
            if (location.pathname !== '/login') {
                navigate('/login');
            }
            return;
        }

        verificationInProgress.current = true;

        try {
            console.log('Vérification du token');
            const apiClient = createApiClient(token);
            const { user: userData } = await apiClient.get(API_ENDPOINTS.VERIFY);
            
            if (!userData) {
                throw new Error('Réponse de vérification invalide');
            }

            setUser(userData);
            
            // Redirection si sur /login
            if (location.pathname === '/login') {
                if (userData.status === 'en_attente') {
                    navigate('/pending-approval');
                } else if (userData.role === 'super_admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/dashboard');
                }
            }

            // Planifier la prochaine vérification dans 5 minutes
            verificationTimer.current = setTimeout(verifyToken, 5 * 60 * 1000);
        } catch (err) {
            console.error('Erreur de vérification:', err);
            logout();
        } finally {
            verificationInProgress.current = false;
            setLoading(false);
        }
    }, [location.pathname, navigate, logout]);

    // Nettoyer le timer lors du démontage
    useEffect(() => {
        return () => {
            if (verificationTimer.current) {
                clearTimeout(verificationTimer.current);
            }
        };
    }, []);

    // Vérifier le token au montage et lors des changements de route
    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        verifyToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    return context;
};

export default AuthContext;
