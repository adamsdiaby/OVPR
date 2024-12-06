import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  MobileStepper,
  Button,
  useTheme,
  Typography
} from '@mui/material';
import {
  Close as CloseIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Edit as EditIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon
} from '@mui/icons-material';
import SwipeableViews from 'react-swipeable-views';

const ImageGallery = ({
  open,
  onClose,
  images,
  initialIndex = 0,
  onEditImage
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const maxSteps = images.length;

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
    setZoom(1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setZoom(1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 1));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          bgcolor: 'background.paper'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Image {activeStep + 1} sur {maxSteps}
          </Typography>
          <Box>
            <IconButton onClick={handleZoomOut} disabled={zoom === 1}>
              <ZoomOutIcon />
            </IconButton>
            <IconButton onClick={handleZoomIn} disabled={zoom === 3}>
              <ZoomInIcon />
            </IconButton>
            <IconButton
              onClick={() => onEditImage(images[activeStep], activeStep)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, position: 'relative', overflow: 'hidden' }}>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={activeStep}
          onChangeIndex={handleStepChange}
          enableMouseEvents
        >
          {images.map((image, index) => (
            <Box
              key={index}
              sx={{
                height: 'calc(90vh - 140px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'black',
                overflow: 'hidden'
              }}
            >
              {Math.abs(activeStep - index) <= 2 ? (
                <img
                  src={image.preview || image.url}
                  alt={`${index + 1}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    transform: `scale(${zoom})`,
                    transition: 'transform 0.3s ease'
                  }}
                />
              ) : null}
            </Box>
          ))}
        </SwipeableViews>

        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          sx={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            bgcolor: 'background.paper'
          }}
          nextButton={
            <Button
              size="small"
              onClick={handleNext}
              disabled={activeStep === maxSteps - 1}
            >
              Suivant
              {theme.direction === 'rtl' ? (
                <KeyboardArrowLeft />
              ) : (
                <KeyboardArrowRight />
              )}
            </Button>
          }
          backButton={
            <Button
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              {theme.direction === 'rtl' ? (
                <KeyboardArrowRight />
              ) : (
                <KeyboardArrowLeft />
              )}
              Précédent
            </Button>
          }
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageGallery;
