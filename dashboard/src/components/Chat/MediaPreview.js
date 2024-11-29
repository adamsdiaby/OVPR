import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Grid,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextIcon,
  SkipPrevious as PrevIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';

const MediaPreview = ({ media, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);

  const currentMedia = media[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await fetch(currentMedia.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentMedia.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMediaContent = () => {
    switch (currentMedia.type) {
      case 'image':
        return (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}
          >
            <img
              src={currentMedia.url}
              alt={currentMedia.name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                transform: `scale(${zoom})`,
                transition: 'transform 0.2s ease-in-out'
              }}
            />
          </Box>
        );

      case 'video':
        return (
          <Box sx={{ width: '100%', height: '100%' }}>
            <video
              src={currentMedia.url}
              controls={true}
              style={{ width: '100%', height: '100%' }}
              playing={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </Box>
        );

      case 'audio':
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 3
            }}
          >
            <audio
              src={currentMedia.url}
              controls={true}
              style={{ width: '100%' }}
              playing={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </Box>
        );

      default:
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 3
            }}
          >
            <Typography variant="h6" color="error">
              Type de média non pris en charge
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {currentMedia.name}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            position: 'relative',
            height: 500,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {renderMediaContent()}

          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 2,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: 2,
              p: 1
            }}
          >
            {media.length > 1 && (
              <>
                <IconButton
                  onClick={handlePrev}
                  size="small"
                  sx={{ color: 'white' }}
                >
                  <PrevIcon />
                </IconButton>

                <Typography
                  variant="body2"
                  sx={{ color: 'white', alignSelf: 'center' }}
                >
                  {currentIndex + 1} / {media.length}
                </Typography>

                <IconButton
                  onClick={handleNext}
                  size="small"
                  sx={{ color: 'white' }}
                >
                  <NextIcon />
                </IconButton>
              </>
            )}

            {currentMedia.type === 'image' && (
              <>
                <IconButton
                  onClick={handleZoomOut}
                  size="small"
                  sx={{ color: 'white' }}
                >
                  <ZoomOutIcon />
                </IconButton>

                <IconButton
                  onClick={handleZoomIn}
                  size="small"
                  sx={{ color: 'white' }}
                >
                  <ZoomInIcon />
                </IconButton>
              </>
            )}

            {(currentMedia.type === 'video' || currentMedia.type === 'audio') && (
              <IconButton
                onClick={() => setIsPlaying(!isPlaying)}
                size="small"
                sx={{ color: 'white' }}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
            )}

            <IconButton
              onClick={handleDownload}
              size="small"
              sx={{ color: 'white' }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <DownloadIcon />
              )}
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Informations sur le fichier
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Type: {currentMedia.type}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Taille: {currentMedia.size}
              </Typography>
            </Grid>
            {currentMedia.dimensions && (
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Dimensions: {currentMedia.dimensions.width} x {currentMedia.dimensions.height}
                </Typography>
              </Grid>
            )}
            {currentMedia.duration && (
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Durée: {currentMedia.duration}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default MediaPreview;
