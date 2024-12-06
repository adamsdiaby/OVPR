import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Slider,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Tooltip,
  Stack,
  Grid
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Contrast,
  Brightness6,
  Colorize,
  Crop,
  Rotate90DegreesCcw,
  FlipCameraIos,
  AspectRatio,
  ZoomIn,
  CropFree,
  Tune,
  FilterVintage,
  Undo,
  Redo
} from '@mui/icons-material';
import Cropper from 'react-easy-crop';

const ASPECT_RATIOS = [
  { value: 16/9, label: '16:9', icon: <AspectRatio /> },
  { value: 4/3, label: '4:3', icon: <AspectRatio /> },
  { value: 1, label: '1:1', icon: <CropFree /> },
  { value: 2/3, label: '2:3', icon: <AspectRatio /> },
  { value: null, label: 'Libre', icon: <CropFree /> }
];

const FILTERS = [
  { name: 'Normal', value: 'none', style: {} },
  { name: 'Noir & Blanc', value: 'grayscale', style: { filter: 'grayscale(100%)' } },
  { name: 'Sépia', value: 'sepia', style: { filter: 'sepia(100%)' } },
  { name: 'Vintage', value: 'vintage', style: { filter: 'sepia(50%) contrast(120%) brightness(90%)' } },
  { name: 'Chaud', value: 'warm', style: { filter: 'saturate(150%) brightness(105%) contrast(110%)' } },
  { name: 'Froid', value: 'cool', style: { filter: 'saturate(80%) brightness(105%) contrast(110%) hue-rotate(30deg)' } }
];

const ImageEditor = ({ open, onClose, image, onSave }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(16/9);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0
  });

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const addToHistory = (state) => {
    const newHistory = [...history.slice(0, historyIndex + 1), state];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setAdjustments(prevState.adjustments);
      setRotation(prevState.rotation);
      setSelectedFilter(prevState.filter);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setAdjustments(nextState.adjustments);
      setRotation(nextState.rotation);
      setSelectedFilter(nextState.filter);
    }
  };

  const handleAdjustmentChange = (type, value) => {
    const newAdjustments = { ...adjustments, [type]: value };
    setAdjustments(newAdjustments);
    addToHistory({
      adjustments: newAdjustments,
      rotation,
      filter: selectedFilter
    });
  };

  const renderAdjustmentControl = (label, icon, value, type, min = 0, max = 200) => (
    <Box sx={{ mb: 2 }}>
      <Box display="flex" alignItems="center" mb={1}>
        <Tooltip title={label}>
          {icon}
        </Tooltip>
        <Typography variant="body2" sx={{ ml: 1 }}>
          {label}: {value}
        </Typography>
      </Box>
      <Slider
        value={value}
        min={min}
        max={max}
        onChange={(e, newValue) => handleAdjustmentChange(type, newValue)}
      />
    </Box>
  );

  const applyFilter = (filterValue) => {
    setSelectedFilter(filterValue);
    addToHistory({
      adjustments,
      rotation,
      filter: filterValue
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Éditer l'image</Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Annuler">
              <IconButton onClick={handleUndo} disabled={historyIndex <= 0}>
                <Undo />
              </IconButton>
            </Tooltip>
            <Tooltip title="Rétablir">
              <IconButton onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
                <Redo />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab icon={<Crop />} label="Recadrage" />
            <Tab icon={<Tune />} label="Ajustements" />
            <Tab icon={<FilterVintage />} label="Filtres" />
          </Tabs>
        </Box>

        <Box sx={{ display: 'flex', height: 'calc(90vh - 200px)' }}>
          <Box sx={{ flex: 1, position: 'relative' }}>
            <Paper 
              sx={{ 
                height: '100%',
                bgcolor: 'black',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{
                  containerStyle: {
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000'
                  },
                  mediaStyle: {
                    ...FILTERS.find(f => f.value === selectedFilter)?.style
                  }
                }}
              />
            </Paper>
          </Box>

          <Box sx={{ width: 300, ml: 2, overflowY: 'auto' }}>
            {activeTab === 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Format
                </Typography>
                <ToggleButtonGroup
                  value={aspectRatio}
                  exclusive
                  onChange={(e, value) => value && setAspectRatio(value)}
                  sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}
                >
                  {ASPECT_RATIOS.map((ratio) => (
                    <ToggleButton 
                      key={ratio.label} 
                      value={ratio.value}
                      sx={{ flex: '1 0 calc(33% - 8px)' }}
                    >
                      <Tooltip title={ratio.label}>
                        {ratio.icon}
                      </Tooltip>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Zoom
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <ZoomIn />
                    <Slider
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={(e, value) => setZoom(value)}
                    />
                  </Stack>
                </Box>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                {renderAdjustmentControl('Luminosité', <Brightness6 />, adjustments.brightness, 'brightness')}
                {renderAdjustmentControl('Contraste', <Contrast />, adjustments.contrast, 'contrast')}
                {renderAdjustmentControl('Saturation', <Colorize />, adjustments.saturation, 'saturation')}
                {renderAdjustmentControl('Flou', <FilterVintage />, adjustments.blur, 'blur', 0, 10)}
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Rotation
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<Rotate90DegreesCcw />}
                      onClick={() => {
                        const newRotation = (rotation - 90) % 360;
                        setRotation(newRotation);
                        addToHistory({
                          adjustments,
                          rotation: newRotation,
                          filter: selectedFilter
                        });
                      }}
                    >
                      -90°
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<FlipCameraIos />}
                      onClick={() => {
                        const newRotation = (rotation + 90) % 360;
                        setRotation(newRotation);
                        addToHistory({
                          adjustments,
                          rotation: newRotation,
                          filter: selectedFilter
                        });
                      }}
                    >
                      +90°
                    </Button>
                  </Stack>
                </Box>
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Filtres
                </Typography>
                <Grid container spacing={1}>
                  {FILTERS.map((filter) => (
                    <Grid item xs={4} key={filter.value}>
                      <Paper
                        sx={{
                          p: 1,
                          cursor: 'pointer',
                          border: filter.value === selectedFilter ? 2 : 0,
                          borderColor: 'primary.main'
                        }}
                        onClick={() => applyFilter(filter.value)}
                      >
                        <Box
                          sx={{
                            width: '100%',
                            height: 60,
                            backgroundImage: `url(${image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            ...filter.style
                          }}
                        />
                        <Typography variant="caption" align="center" display="block">
                          {filter.name}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          onClick={() => {
            onSave({
              croppedAreaPixels,
              rotation,
              adjustments,
              filter: selectedFilter
            });
          }}
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
        >
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageEditor;
