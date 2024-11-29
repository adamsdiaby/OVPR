import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Skeleton,
  Link
} from '@mui/material';

const UrlPreview = ({ url }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/chat/url-preview?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement de l\'aperçu');
        }
        const data = await response.json();
        setPreview(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchPreview();
    }
  }, [url]);

  if (loading) {
    return (
      <Card sx={{ maxWidth: 345, my: 1 }}>
        <Skeleton variant="rectangular" height={140} />
        <CardContent>
          <Skeleton variant="text" />
          <Skeleton variant="text" width="60%" />
        </CardContent>
      </Card>
    );
  }

  if (error || !preview) {
    return null;
  }

  return (
    <Link 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      underline="none"
      sx={{ 
        display: 'block',
        maxWidth: 345,
        my: 1,
        '&:hover': {
          opacity: 0.9
        }
      }}
    >
      <Card>
        {preview.image && (
          <CardMedia
            component="img"
            height="140"
            image={preview.image}
            alt={preview.title}
            sx={{ objectFit: 'cover' }}
          />
        )}
        <CardContent>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {preview.title}
          </Typography>
          {preview.description && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {preview.description}
            </Typography>
          )}
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ mt: 1, display: 'block' }}
          >
            {new URL(url).hostname}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
};

export default UrlPreview;
