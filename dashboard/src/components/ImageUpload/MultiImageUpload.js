import React, { useState } from 'react';
import {
  Box,
  Button,
  ImageList,
  ImageListItem,
  IconButton,
  Typography,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const MultiImageUpload = ({ images, setImages, maxImages = 5 }) => {
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + images.length > maxImages) {
      alert(`Vous ne pouvez télécharger que ${maxImages} images maximum`);
      return;
    }

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/jpeg') || 
                     file.type.startsWith('image/png') ||
                     file.type.startsWith('image/jpg');
      if (!isValid) {
        alert(`Le fichier ${file.name} n'est pas une image valide (JPG, JPEG ou PNG uniquement)`);
      }
      return isValid;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, {
          file: file,
          preview: reader.result
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <input
        accept="image/jpeg,image/png,image/jpg"
        style={{ display: 'none' }}
        id="image-upload-button"
        type="file"
        multiple
        onChange={handleImageUpload}
      />
      <label htmlFor="image-upload-button">
        <Button
          variant="outlined"
          component="span"
          startIcon={<CloudUploadIcon />}
          disabled={images.length >= maxImages}
        >
          Ajouter des photos
        </Button>
      </label>
      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
        Formats acceptés: JPG, JPEG, PNG. Maximum {maxImages} images.
      </Typography>

      {images.length > 0 && (
        <ImageList sx={{ width: '100%', height: 'auto', mt: 2 }} cols={3} rowHeight={164}>
          {images.map((image, index) => (
            <ImageListItem key={index} sx={{ position: 'relative' }}>
              <img
                src={image.preview}
                alt={`Image ${index + 1}`}
                loading="lazy"
                style={{ height: '164px', objectFit: 'cover' }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
                size="small"
                onClick={() => handleRemoveImage(index)}
              >
                <DeleteIcon sx={{ color: 'white' }} />
              </IconButton>
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Box>
  );
};

export default MultiImageUpload;
