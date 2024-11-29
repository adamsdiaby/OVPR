import React from 'react';
import {
  Box,
  Paper,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ChatRooms from '../../components/Chat/ChatRooms';
import ChatEnhanced from '../../components/Chat/ChatEnhanced';
import { useChat } from '../../contexts/ChatContext';

const ChatPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentRoom, rooms, setCurrentRoom } = useChat();

  return (
    <Box sx={{ height: '100%', p: 2 }}>
      <Paper
        elevation={3}
        sx={{
          height: '100%',
          overflow: 'hidden',
          display: 'flex'
        }}
      >
        <Grid container sx={{ height: '100%' }}>
          {(!isMobile || !currentRoom) && (
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                borderRight: 1,
                borderColor: 'divider',
                height: '100%',
                overflow: 'auto'
              }}
            >
              <ChatRooms
                rooms={rooms}
                currentRoom={currentRoom}
                onRoomSelect={setCurrentRoom}
              />
            </Grid>
          )}
          
          {(!isMobile || currentRoom) && (
            <Grid
              item
              xs={12}
              md={8}
              sx={{ height: '100%', overflow: 'hidden' }}
            >
              {currentRoom ? (
                <Box sx={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
                  <ChatEnhanced roomId={currentRoom._id} />
                </Box>
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary'
                  }}
                >
                  Sélectionnez un salon pour commencer à discuter
                </Box>
              )}
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ChatPage;
