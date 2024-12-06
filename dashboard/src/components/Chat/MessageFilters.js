import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { fr } from 'date-fns/locale';

const MessageFilters = ({ onApplyFilters }) => {
  const [filters, setFilters] = React.useState({
    startDate: null,
    endDate: null,
    keyword: '',
    type: 'all'
  });

  const handleChange = (field) => (value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleReset = () => {
    setFilters({
      startDate: null,
      endDate: null,
      keyword: '',
      type: 'all'
    });
    onApplyFilters({
      startDate: null,
      endDate: null,
      keyword: '',
      type: 'all'
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          <DatePicker
            label="Date de début"
            value={filters.startDate}
            onChange={handleChange('startDate')}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
          
          <DatePicker
            label="Date de fin"
            value={filters.endDate}
            onChange={handleChange('endDate')}
            renderInput={(params) => <TextField {...params} fullWidth />}
            minDate={filters.startDate}
          />

          <TextField
            fullWidth
            label="Mot-clé"
            value={filters.keyword}
            onChange={(e) => handleChange('keyword')(e.target.value)}
          />

          <FormControl fullWidth>
            <InputLabel>Type de message</InputLabel>
            <Select
              value={filters.type}
              label="Type de message"
              onChange={(e) => handleChange('type')(e.target.value)}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="text">Texte</MenuItem>
              <MenuItem value="image">Image</MenuItem>
              <MenuItem value="file">Fichier</MenuItem>
            </Select>
          </FormControl>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={handleApply}
              fullWidth
            >
              Appliquer
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              fullWidth
            >
              Réinitialiser
            </Button>
          </Stack>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};

export default MessageFilters;
