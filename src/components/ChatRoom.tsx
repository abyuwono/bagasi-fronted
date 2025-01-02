import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
  Grid,
  Button
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

interface Message {
  id: string;
  text: string;
  sender: {
    id: string;
    username: string;
  };
  createdAt: string;
}

interface ChatRoom {
  id: string;
  ad: {
    id: string;
    productUrl: string;
  };
  shopper: {
    id: string;
    username: string;
  };
  traveler: {
    id: string;
    username: string;
  };
  messages: Message[];
}

interface ChatRoomProps {
  adId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ adId }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chat, setChat] = useState<ChatRoom | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await api.get(`/chat/ad/${adId}`);
        setChat(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching chat:', err);
        setError(err.response?.data?.message || 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    fetchChat();

    // Set up polling for new messages
    const pollInterval = setInterval(fetchChat, 5000);

    return () => clearInterval(pollInterval);
  }, [adId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !chat) {
      return;
    }

    try {
      const response = await api.post(`/chat/ad/${chat.id}/messages`, {
        text: message,
      });

      setChat((prevChat) => {
        if (!prevChat) return null;
        return {
          ...prevChat,
          messages: [...prevChat.messages, response.data],
        };
      });

      setMessage('');
      setError(null);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!chat) {
    return (
      <Alert severity="info">
        No chat found for this ad
      </Alert>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Chat Room
      </Typography>
      
      <Paper
        ref={chatContainerRef}
        sx={{
          flex: 1,
          mb: 2,
          p: 2,
          maxHeight: '500px',
          overflowY: 'auto',
          bgcolor: 'grey.50'
        }}
      >
        {chat.messages.map((msg) => {
          const isOwnMessage = msg.sender.id === user?.id;

          return (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  maxWidth: '70%',
                  bgcolor: isOwnMessage ? 'primary.main' : 'white',
                  color: isOwnMessage ? 'white' : 'text.primary',
                  borderRadius: 2,
                  p: 2,
                  position: 'relative',
                }}
              >
                <Typography variant="body2" gutterBottom>
                  {msg.text}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 1,
                    color: isOwnMessage ? 'white' : 'text.secondary',
                  }}
                >
                  {msg.sender.username} • {new Date(msg.createdAt).toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Paper>

      <Box component="form" onSubmit={handleSendMessage} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Grid>
          <Grid item>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!message.trim()}
            >
              Send
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ChatRoom;
