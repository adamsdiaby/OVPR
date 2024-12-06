import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { prepareImageForUpload, IMAGE_CONFIG } from '../../utils/imageUtils';
import SortableImageGrid from './SortableImageGrid';
import ImageEditor from './ImageEditor';
import ImageGallery from './ImageGallery';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ImageUpload = ({ images = [], onChange, maxImages = 10, disabled = false }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState({});
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    event.target.value = '';

    if (images.length + files.length > maxImages) {
      setError(`Vous ne pouvez pas télécharger plus de ${maxImages} images`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const validFiles = [];

      for (const file of files) {
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 0
        }));

        const { file: processedFile, error } = await prepareImageForUpload(file);
        
        if (error) {
          throw new Error(`Erreur avec ${file.name}: ${error}`);
        }

        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 50
        }));

        const imageUrl = URL.createObjectURL(processedFile);
        
        validFiles.push({
          file: processedFile,
          preview: imageUrl,
          name: file.name,
          size: processedFile.size,
          type: processedFile.type
        });

        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100
        }));
      }

      onChange([...images, ...validFiles]);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetMainImage = (index) => {
    setMainImageIndex(index);
    const newImages = [...images];
    const [mainImage] = newImages.splice(index, 1);
    newImages.unshift(mainImage);
    onChange(newImages);
    setMainImageIndex(0);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    const removedImage = newImages[index];
    
    if (removedImage.preview) {
      URL.revokeObjectURL(removedImage.preview);
    }
    
    newImages.splice(index, 1);
    onChange(newImages);

    if (index === mainImageIndex) {
      setMainImageIndex(0);
    }
  };

  const handlePreview = (imageUrl, index) => {
    setSelectedImageIndex(index);
    setGalleryOpen(true);
  };

  const handleEditImage = (image, index) => {
    setSelectedImage(image.preview || image.url);
    setSelectedImageIndex(index);
    setEditorOpen(true);
    setGalleryOpen(false);
  };

  const handleSaveEdit = (editedImageUrl) => {
    const newImages = [...images];
    const oldImage = newImages[selectedImageIndex];
    
    if (oldImage.preview) {
      URL.revokeObjectURL(oldImage.preview);
    }

    newImages[selectedImageIndex] = {
      ...oldImage,
      preview: editedImageUrl,
      edited: true
    };

    onChange(newImages);
    setEditorOpen(false);
  };

  const handleImagesReorder = (newImages) => {
    onChange(newImages);
  };

  return (
    <Box>
      <Box
        sx={{
          border: '2px dashed',
          borderColor: 'primary.main',
          borderRadius: 1,
          p: 2,
          mb: 2,
          textAlign: 'center',
          bgcolor: 'background.paper',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1
        }}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileSelect}
          disabled={disabled}
        />
        <CloudUploadIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          Déposez vos images ici
        </Typography>
        <Typography variant="body2" color="textSecondary">
          ou cliquez pour sélectionner
        </Typography>
        <Typography variant="caption" display="block" color="textSecondary">
          JPG, PNG ou WEBP • Max {maxImages} images • {IMAGE_CONFIG.maxSize / (1024 * 1024)}MB par image
          • {IMAGE_CONFIG.maxWidth}x{IMAGE_CONFIG.maxHeight} max
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" mb={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      {images.length > 0 && (
        <SortableImageGrid
          images={images}
          onImagesReorder={handleImagesReorder}
          onRemoveImage={handleRemoveImage}
          onPreviewImage={handlePreview}
          onSetMainImage={handleSetMainImage}
          mainImageIndex={mainImageIndex}
          uploadProgress={uploadProgress}
        />
      )}

      <ImageGallery
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={images}
        initialIndex={selectedImageIndex}
        onEditImage={handleEditImage}
      />

      <ImageEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        image={selectedImage}
        onSave={handleSaveEdit}
      />
    </Box>
  );
};

export default ImageUpload;
