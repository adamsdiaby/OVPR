import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { Box, Paper, Typography, Chip, useTheme } from '@mui/material';
import L from 'leaflet';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';

// Correction des icônes Leaflet pour React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Données mockées des annonces avec coordonnées de villes ivoiriennes
const mockAnnouncements = [
  {
    id: 1,
    title: 'iPhone 14 Pro',
    status: 'vole',
    location: 'Abidjan, Cocody',
    coordinates: [5.3599517, -4.0082563],
    date: '2024-01-15',
  },
  {
    id: 2,
    title: 'Sac à main',
    status: 'perdu',
    location: 'Yamoussoukro',
    coordinates: [6.8276228, -5.2893433],
    date: '2024-01-14',
  },
  {
    id: 3,
    title: 'Clés de voiture',
    status: 'retrouve',
    location: 'Bouaké',
    coordinates: [7.6902729, -5.0277699],
    date: '2024-01-13',
  },
  {
    id: 4,
    title: 'Portefeuille',
    status: 'oublie',
    location: 'San Pedro',
    coordinates: [4.7453841, -6.6166734],
    date: '2024-01-12',
  },
  {
    id: 5,
    title: 'Ordinateur portable',
    status: 'vole',
    location: 'Abidjan, Plateau',
    coordinates: [5.3220720, -4.0217612],
    date: '2024-01-11',
  },
  {
    id: 6,
    title: 'Téléphone Samsung',
    status: 'perdu',
    location: 'Korhogo',
    coordinates: [9.4580772, -5.6297437],
    date: '2024-01-10',
  }
];

const statusColors = {
  vole: '#6B46C1',    // Violet
  oublie: '#FF9800',  // Orange
  perdu: '#f44336',   // Rouge
  retrouve: '#4CAF50', // Vert
};

const statusLabels = {
  vole: 'Volé',
  oublie: 'Oublié',
  perdu: 'Perdu',
  retrouve: 'Retrouvé',
};

const InteractiveMap = () => {
  const theme = useTheme();
  // Centre de la Côte d'Ivoire
  const defaultCenter = [7.539989, -5.547080];
  const defaultZoom = 7;
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    // Création des clusters d'annonces
    const points = turf.featureCollection(
      mockAnnouncements.map(item => 
        turf.point([item.coordinates[1], item.coordinates[0]], { ...item })
      )
    );

    const clustered = turf.clustersKmeans(points, {
      numberOfClusters: Math.min(5, mockAnnouncements.length),
      mutate: true
    });

    const clusterGroups = {};
    clustered.features.forEach(point => {
      const cluster = point.properties.cluster;
      if (!clusterGroups[cluster]) {
        clusterGroups[cluster] = [];
      }
      clusterGroups[cluster].push(point);
    });

    setClusters(Object.values(clusterGroups));
  }, []);

  const getMarkerColor = (status) => {
    return statusColors[status] || theme.palette.primary.main;
  };

  return (
    <Paper sx={{ mt: 4, p: 3, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Carte des Annonces en Côte d'Ivoire
      </Typography>
      
      <Box sx={{ height: 500, width: '100%', position: 'relative' }}>
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%', borderRadius: theme.shape.borderRadius }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {mockAnnouncements.map((item) => (
            <Marker 
              key={item.id}
              position={[item.coordinates[0], item.coordinates[1]]}
            >
              <Popup>
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Chip
                    label={statusLabels[item.status]}
                    size="small"
                    sx={{
                      backgroundColor: `${getMarkerColor(item.status)}15`,
                      color: getMarkerColor(item.status),
                      fontWeight: 500,
                      mb: 1,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {item.location}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.date).toLocaleDateString()}
                  </Typography>
                </Box>
              </Popup>
            </Marker>
          ))}

          {clusters.map((cluster, index) => {
            const center = turf.center(turf.featureCollection(cluster));
            const count = cluster.length;
            const coordinates = center.geometry.coordinates;
            
            return (
              <CircleMarker
                key={index}
                center={[coordinates[1], coordinates[0]]}
                radius={Math.min(20, 10 + count * 2)}
                fillColor={theme.palette.primary.main}
                color={theme.palette.primary.dark}
                weight={2}
                opacity={0.6}
                fillOpacity={0.4}
              >
                <Popup>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Groupe d'annonces ({count})
                    </Typography>
                    {cluster.map(point => (
                      <Typography key={point.properties.id} variant="body2" sx={{ mb: 0.5 }}>
                        {point.properties.title}
                      </Typography>
                    ))}
                  </Box>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </Box>
    </Paper>
  );
};

export default InteractiveMap;
