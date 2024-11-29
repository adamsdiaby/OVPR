import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import {
  Download as DownloadIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const ConversationExport = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [options, setOptions] = useState({
    format: 'pdf',
    dateRange: [null, null],
    includeMedia: true,
    includeMetadata: true,
    anonymize: false,
    selectedUsers: [],
    selectedRooms: []
  });

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch('/api/chat/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation_export_${new Date().toISOString().split('T')[0]}.${options.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        startIcon={<SettingsIcon />}
        onClick={() => setOpen(true)}
        variant="outlined"
      >
        Exporter les conversations
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Export des conversations
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success">
                Export réussi !
              </Alert>
            )}

            <FormControl fullWidth>
              <InputLabel>Format d'export</InputLabel>
              <Select
                value={options.format}
                onChange={(e) => setOptions({ ...options, format: e.target.value })}
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="html">HTML</MenuItem>
                <MenuItem value="txt">Texte</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>

            <DateRangePicker
              startText="Date début"
              endText="Date fin"
              value={options.dateRange}
              onChange={(newRange) => setOptions({ ...options, dateRange: newRange })}
              renderInput={(startProps, endProps) => (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField {...startProps} />
                  <TextField {...endProps} />
                </Box>
              )}
            />

            <FormControl fullWidth>
              <InputLabel>Salons</InputLabel>
              <Select
                multiple
                value={options.selectedRooms}
                onChange={(e) => setOptions({ ...options, selectedRooms: e.target.value })}
                renderValue={(selected) => selected.join(', ')}
              >
                <MenuItem value="all">Tous les salons</MenuItem>
                <MenuItem value="general">Général</MenuItem>
                <MenuItem value="support">Support</MenuItem>
                <MenuItem value="annonces">Annonces</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Utilisateurs</InputLabel>
              <Select
                multiple
                value={options.selectedUsers}
                onChange={(e) => setOptions({ ...options, selectedUsers: e.target.value })}
                renderValue={(selected) => selected.join(', ')}
              >
                <MenuItem value="all">Tous les utilisateurs</MenuItem>
                <MenuItem value="active">Utilisateurs actifs</MenuItem>
                <MenuItem value="admins">Administrateurs</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeMedia}
                    onChange={(e) => setOptions({ ...options, includeMedia: e.target.checked })}
                  />
                }
                label="Inclure les médias"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeMetadata}
                    onChange={(e) => setOptions({ ...options, includeMetadata: e.target.checked })}
                  />
                }
                label="Inclure les métadonnées"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.anonymize}
                    onChange={(e) => setOptions({ ...options, anonymize: e.target.checked })}
                  />
                }
                label="Anonymiser les données"
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleExport}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
          >
            Exporter
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConversationExport;
