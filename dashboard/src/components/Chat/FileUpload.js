import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  LinearProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  AttachFile as AttachIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const FileUpload = ({ onFileSelect, maxSize = 10 * 1024 * 1024 }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = selectedFiles.filter(file => {
      if (file.size > maxSize) {
        setError(`Le fichier ${file.name} dépasse la taille maximale autorisée (${maxSize / 1024 / 1024}MB)`);
        return false;
      }
      return true;
    });

    setFiles(prevFiles => [...prevFiles, ...validFiles]);
    event.target.value = null; // Reset input
  };

  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    setUploading(true);
    setError(null);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        
        // Suivre la progression
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: (event.loaded / event.total) * 100
            }));
          }
        };

        // Promesse pour le téléchargement
        const uploadPromise = new Promise((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } else {
              reject(new Error(`Erreur lors du téléchargement de ${file.name}`));
            }
          };
          xhr.onerror = () => reject(new Error(`Erreur réseau pour ${file.name}`));
        });

        // Envoyer la requête
        xhr.open('POST', '/api/upload', true);
        xhr.send(formData);

        return uploadPromise;
      });

      const results = await Promise.all(uploadPromises);
      onFileSelect(results);
      setFiles([]);
      setUploadProgress({});
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Button
        component="label"
        variant="outlined"
        startIcon={<AttachIcon />}
        sx={{ mb: 2 }}
      >
        Ajouter des fichiers
        <VisuallyHiddenInput
          type="file"
          multiple
          onChange={handleFileSelect}
          ref={fileInputRef}
        />
      </Button>

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {files.length > 0 && (
        <List>
          {files.map((file, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={file.name}
                secondary={formatFileSize(file.size)}
              />
              {uploadProgress[file.name] && (
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress[file.name]}
                  />
                </Box>
              )}
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleRemoveFile(index)}
                  disabled={uploading}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {files.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            {uploading ? 'Téléchargement...' : 'Télécharger'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
