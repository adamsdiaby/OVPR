import api from './api';

export const AnnoncesService = {
  // Récupérer toutes les annonces
  getAllAnnonces: async (filters = {}) => {
    const response = await api.get('/annonces', { params: filters });
    return response.data;
  },

  // Récupérer une annonce par son ID
  getAnnonceById: async (id) => {
    const response = await api.get(`/annonces/${id}`);
    return response.data;
  },

  // Créer une nouvelle annonce
  createAnnonce: async (annonceData) => {
    const formData = new FormData();
    
    // Ajouter les données de base
    Object.keys(annonceData).forEach(key => {
      if (key !== 'images') {
        if (typeof annonceData[key] === 'object') {
          formData.append(key, JSON.stringify(annonceData[key]));
        } else {
          formData.append(key, annonceData[key]);
        }
      }
    });

    // Ajouter les images
    if (annonceData.images && annonceData.images.length > 0) {
      annonceData.images.forEach((image, index) => {
        formData.append('images', image);
      });
    }

    const response = await api.post('/annonces', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Mettre à jour une annonce
  updateAnnonce: async (id, annonceData) => {
    const formData = new FormData();
    
    // Ajouter les données de base
    Object.keys(annonceData).forEach(key => {
      if (key !== 'images') {
        if (typeof annonceData[key] === 'object') {
          formData.append(key, JSON.stringify(annonceData[key]));
        } else {
          formData.append(key, annonceData[key]);
        }
      }
    });

    // Ajouter les images
    if (annonceData.images && annonceData.images.length > 0) {
      annonceData.images.forEach((image, index) => {
        if (image instanceof File) {
          formData.append('images', image);
        } else {
          formData.append('existingImages', JSON.stringify(image));
        }
      });
    }

    const response = await api.put(`/annonces/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Supprimer une annonce
  deleteAnnonce: async (id) => {
    const response = await api.delete(`/annonces/${id}`);
    return response.data;
  },

  // Changer le statut d'une annonce
  updateAnnonceStatus: async (id, status) => {
    const response = await api.patch(`/annonces/${id}/status`, { status });
    return response.data;
  },

  // Rechercher des annonces
  searchAnnonces: async (searchParams) => {
    const response = await api.get('/annonces/search', { params: searchParams });
    return response.data;
  },

  // Obtenir les statistiques des annonces
  getAnnonceStats: async (params = {}) => {
    const response = await api.get('/annonces/stats', { params });
    return response.data;
  }
};
