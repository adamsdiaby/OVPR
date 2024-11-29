const express = require('express');
const router = express.Router();
const got = require('got');
const cheerio = require('cheerio');
const { URL } = require('url');

// Cache pour stocker les aperçus d'URL
const urlCache = new Map();
const CACHE_DURATION = 3600000; // 1 heure en millisecondes

const extractMetadata = async (url) => {
  try {
    const response = await got(url);
    const $ = cheerio.load(response.body);
    
    const metadata = {
      title: '',
      description: '',
      image: '',
      url: url
    };

    // Essayer d'extraire les métadonnées OpenGraph
    metadata.title = $('meta[property="og:title"]').attr('content') ||
                    $('title').text() ||
                    $('meta[name="title"]').attr('content');

    metadata.description = $('meta[property="og:description"]').attr('content') ||
                         $('meta[name="description"]').attr('content');

    metadata.image = $('meta[property="og:image"]').attr('content') ||
                    $('meta[property="twitter:image"]').attr('content');

    // Nettoyer et valider les données
    if (metadata.image && !metadata.image.startsWith('http')) {
      const baseUrl = new URL(url);
      metadata.image = new URL(metadata.image, baseUrl.origin).toString();
    }

    metadata.title = metadata.title?.trim();
    metadata.description = metadata.description?.trim();

    return metadata;
  } catch (error) {
    console.error('Erreur lors de l\'extraction des métadonnées:', error);
    throw error;
  }
};

router.get('/url-preview', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL requise' });
    }

    // Vérifier si l'URL est valide
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ error: 'URL invalide' });
    }

    // Vérifier le cache
    const cachedData = urlCache.get(url);
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      return res.json(cachedData.data);
    }

    const metadata = await extractMetadata(url);

    // Mettre en cache
    urlCache.set(url, {
      data: metadata,
      timestamp: Date.now()
    });

    res.json(metadata);
  } catch (error) {
    console.error('Erreur lors de la génération de l\'aperçu:', error);
    res.status(500).json({ error: 'Erreur lors de la génération de l\'aperçu' });
  }
});

// Nettoyer périodiquement le cache
setInterval(() => {
  const now = Date.now();
  for (const [url, data] of urlCache.entries()) {
    if (now - data.timestamp > CACHE_DURATION) {
      urlCache.delete(url);
    }
  }
}, CACHE_DURATION);

module.exports = router;
