import React from 'react';
import {
  Grid,
  IconButton,
  Box
} from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Delete as DeleteIcon,
  ZoomIn as ZoomInIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import ImageProgress from './ImageProgress';

// Composant d'image triable individuel
const SortableImage = ({ image, index, onRemove, onPreview, onSetMain, isMain, uploadProgress }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.preview || image.url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
  };

  return (
    <Grid item xs={6} sm={4} md={3}>
      <Box
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        sx={{
          position: 'relative',
          paddingTop: '100%',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: isMain ? 3 : 1,
          border: isMain ? '2px solid primary.main' : 'none',
          '&:hover .image-actions': {
            opacity: 1,
          },
        }}
      >
        <img
          src={image.preview || image.url}
          alt={`${index + 1}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <Box
          className="image-actions"
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            p: 0.5,
            display: 'flex',
            gap: 0.5,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            opacity: 0,
            transition: 'opacity 0.2s',
          }}
        >
          <IconButton
            size="small"
            onClick={() => onSetMain(index)}
            sx={{ color: 'white' }}
          >
            {isMain ? <StarIcon /> : <StarBorderIcon />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onPreview(image.preview || image.url)}
            sx={{ color: 'white' }}
          >
            <ZoomInIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onRemove(index)}
            sx={{ color: 'white' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
        {uploadProgress !== undefined && uploadProgress < 100 && (
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 1 }}>
            <ImageProgress progress={uploadProgress} fileName={image.name} />
          </Box>
        )}
      </Box>
    </Grid>
  );
};

// Grille d'images triable
const SortableImageGrid = ({
  images,
  onImagesReorder,
  onRemoveImage,
  onPreviewImage,
  onSetMainImage,
  mainImageIndex,
  uploadProgress = {}
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = images.findIndex(img => (img.preview || img.url) === active.id);
      const newIndex = images.findIndex(img => (img.preview || img.url) === over.id);
      
      onImagesReorder(arrayMove(images, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={images.map(img => img.preview || img.url)}
        strategy={rectSortingStrategy}
      >
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <SortableImage
              key={image.preview || image.url}
              image={image}
              index={index}
              onRemove={onRemoveImage}
              onPreview={onPreviewImage}
              onSetMain={onSetMainImage}
              isMain={index === mainImageIndex}
              uploadProgress={uploadProgress[image.name]}
            />
          ))}
        </Grid>
      </SortableContext>
    </DndContext>
  );
};

export default SortableImageGrid;
