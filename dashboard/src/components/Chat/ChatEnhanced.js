import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Assessment as StatsIcon,
  GetApp as ExportIcon,
  Security as ModerationIcon
} from '@mui/icons-material';

import UserStats from './UserStats';
import ConversationExport from './ConversationExport';
import MessageModeration from './MessageModeration';
import ChatWindow from './ChatWindow';
import UrlPreview from './UrlPreview';

const ChatEnhanced = ({ roomId }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ borderRadius: 0 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          px: 2 
        }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            aria-label="chat tabs"
          >
            <Tab label="Chat" />
            <Tab label="Statistiques" />
            <Tab label="Modération" />
          </Tabs>
          
          <Box>
            <Tooltip title="Exporter les conversations">
              <IconButton onClick={() => setShowExportDialog(true)}>
                <ExportIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Divider />
      </Paper>

      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {currentTab === 0 && (
          <ChatWindow 
            roomId={roomId}
            UrlPreviewComponent={UrlPreview}
          />
        )}
        {currentTab === 1 && <UserStats />}
        {currentTab === 2 && <MessageModeration />}
      </Box>

      <ConversationExport 
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
    </Box>
  );
};

export default ChatEnhanced;
