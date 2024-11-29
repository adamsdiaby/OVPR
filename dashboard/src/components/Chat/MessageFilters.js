import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const MessageFilters = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    text: '',
    user: '',
    dateRange: [null, null],
    type: 'all',
    hasAttachments: false,
    hasReactions: false,
    isPinned: false
  });

  const [savedFilters, setSavedFilters] = useState([]);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');

  const handleFilterChange = (field) => (event) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateRangeChange = (newRange) => {
    setFilters(prev => ({
      ...prev,
      dateRange: newRange
    }));
  };

  const handleToggleFilter = (field) => () => {
    setFilters(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const applyFilters = () => {
    onFilter(filters);
  };

  const clearFilters = () => {
    setFilters({
      text: '',
      user: '',
      dateRange: [null, null],
      type: 'all',
      hasAttachments: false,
      hasReactions: false,
      isPinned: false
    });
    onFilter(null);
  };

  const saveFilter = () => {
    if (filterName) {
      setSavedFilters(prev => [
        ...prev,
        {
          name: filterName,
          filters: { ...filters }
        }
      ]);
      setSaveDialogOpen(false);
      setFilterName('');
    }
  };

  const loadSavedFilter = (savedFilter) => {
    setFilters(savedFilter.filters);
    setFilterMenuAnchor(null);
    onFilter(savedFilter.filters);
  };

  const deleteSavedFilter = (index) => {
    setSavedFilters(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          Filtres de messages
        </Typography>
        <Box>
          <Tooltip title="Filtres sauvegardés">
            <IconButton onClick={(e) => setFilterMenuAnchor(e.currentTarget)}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sauvegarder le filtre">
            <IconButton onClick={() => setSaveDialogOpen(true)}>
              <SaveIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Stack spacing={2}>
        <TextField
          fullWidth
          size="small"
          label="Rechercher dans les messages"
          value={filters.text}
          onChange={handleFilterChange('text')}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
          }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            label="Utilisateur"
            value={filters.user}
            onChange={handleFilterChange('user')}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={handleFilterChange('type')}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="text">Texte</MenuItem>
              <MenuItem value="file">Fichiers</MenuItem>
              <MenuItem value="image">Images</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <DateRangePicker
          startText="Date début"
          endText="Date fin"
          value={filters.dateRange}
          onChange={handleDateRangeChange}
          renderInput={(startProps, endProps) => (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField {...startProps} size="small" />
              <TextField {...endProps} size="small" />
            </Box>
          )}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="Pièces jointes"
            onClick={handleToggleFilter('hasAttachments')}
            color={filters.hasAttachments ? 'primary' : 'default'}
          />
          <Chip
            label="Réactions"
            onClick={handleToggleFilter('hasReactions')}
            color={filters.hasReactions ? 'primary' : 'default'}
          />
          <Chip
            label="Épinglés"
            onClick={handleToggleFilter('isPinned')}
            color={filters.isPinned ? 'primary' : 'default'}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            startIcon={<ClearIcon />}
            onClick={clearFilters}
          >
            Effacer
          </Button>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={applyFilters}
          >
            Appliquer
          </Button>
        </Box>
      </Stack>

      {/* Menu des filtres sauvegardés */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        {savedFilters.map((filter, index) => (
          <MenuItem
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2
            }}
          >
            <Box onClick={() => loadSavedFilter(filter)}>
              {filter.name}
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                deleteSavedFilter(index);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </MenuItem>
        ))}
        {savedFilters.length === 0 && (
          <MenuItem disabled>
            Aucun filtre sauvegardé
          </MenuItem>
        )}
      </Menu>

      {/* Dialog pour sauvegarder un filtre */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
      >
        <DialogTitle>Sauvegarder le filtre</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom du filtre"
            fullWidth
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>
            Annuler
          </Button>
          <Button onClick={saveFilter} variant="contained">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default MessageFilters;
