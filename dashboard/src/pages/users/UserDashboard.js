import React, { useState, useEffect } from 'react';
import { Card, Grid, Typography, Box } from '@mui/material';
import { PeopleAlt, SupervisorAccount, Block } from '@mui/icons-material';
import axios from 'axios';

const UserDashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        suspended: 0,
        admins: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/api/admin/users/stats', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setStats(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des statistiques:', error);
            }
        };

        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon, color }) => (
        <Card sx={{ p: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography variant="h6" color="textSecondary">
                        {title}
                    </Typography>
                    <Typography variant="h4">
                        {value}
                    </Typography>
                </Box>
                <Box sx={{ 
                    backgroundColor: `${color}20`,
                    p: 1,
                    borderRadius: '50%'
                }}>
                    {icon}
                </Box>
            </Box>
        </Card>
    );

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Tableau de Bord Utilisateurs
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Utilisateurs"
                        value={stats.total}
                        icon={<PeopleAlt sx={{ fontSize: 40, color: '#1976d2' }} />}
                        color="#1976d2"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Utilisateurs Actifs"
                        value={stats.active}
                        icon={<PeopleAlt sx={{ fontSize: 40, color: '#2e7d32' }} />}
                        color="#2e7d32"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Utilisateurs Suspendus"
                        value={stats.suspended}
                        icon={<Block sx={{ fontSize: 40, color: '#d32f2f' }} />}
                        color="#d32f2f"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Administrateurs"
                        value={stats.admins}
                        icon={<SupervisorAccount sx={{ fontSize: 40, color: '#ed6c02' }} />}
                        color="#ed6c02"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default UserDashboard;
