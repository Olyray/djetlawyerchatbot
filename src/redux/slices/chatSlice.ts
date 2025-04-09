// Redux slice for managing chat-related state and operations
// Handles chat history, message sending, and chat selection
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Chat, Message, ChatResponse, ChatState, Attachment } from '../../types/chat';
import { API_BASE_URL } from '../../utils/config';
import { refreshToken } from '../../utils/tokenManager';
import { clearCredentials } from './authSlice';
import { AppDispatch } from '../store';
import { incrementMessageCount } from './anonymousSlice';

// Define the extended chat response interface that includes message and attachments
interface ExtendedChatResponse extends ChatResponse {
  message: string;
  attachments?: Attachment[];
}

// Async thunk to fetch all chats for authenticated users
// Handles token refresh if the current token is expired
export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async (_, { getState, dispatch }) => {
    const { auth } = getState() as { auth: { token: string; refreshToken: string } };
    let response = await fetch(`${API_BASE_URL}/api/v1/chat/chats`, {
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    });

    // Handle token expiration by attempting to refresh
    if (response.status === 401 && auth.refreshToken) {
      try {
        await refreshToken(auth.refreshToken, dispatch as AppDispatch);
        const newState = getState() as { auth: { token: string } };
        response = await fetch(`${API_BASE_URL}/api/v1/chat/chats`, {
          headers: {
            'Authorization': `Bearer ${newState.auth.token}`
          }
        });
      } catch (refreshError) {
        dispatch(clearCredentials());
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }
    return response.json();
  }
);

// Async thunk to send a message to the chatbot
// Handles both authenticated and anonymous users
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ 
    message, 
    chatId, 
    attachments = [] 
  }: { 
    message: string; 
    chatId?: string; 
    attachments?: Array<{id: string, file_name: string, file_type: string}>
  }, { getState, dispatch }) => {
    const { auth, anonymous } = getState() as { 
      auth: { token: string; refreshToken: string }, 
      anonymous: { sessionId: string } 
    };

    // Prepare request body
    // Include attachments in the request body
    const requestBody = {
      message,
      chat_id: chatId || null,
      attachments: attachments.length > 0 ? attachments.map(a => ({
        id: a.id,
        file_name: a.file_name,
        file_type: a.file_type
      })) : undefined
    };

    let headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (auth.token) {
      headers['Authorization'] = `Bearer ${auth.token}`;
      headers['X-Anonymous-Session-Id'] = anonymous.sessionId;
    } else {
      headers['X-Anonymous-Session-Id'] = anonymous.sessionId;
    }

    // Call API
    let response = await fetch(`${API_BASE_URL}/api/v1/chatbot/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    // Handle token refresh if expired
    if (response.status === 401 && auth.token && auth.refreshToken) {
      try {
        await refreshToken(auth.refreshToken, dispatch as AppDispatch);
        const newState = getState() as { auth: { token: string } };
        
        headers['Authorization'] = `Bearer ${newState.auth.token}`;
        
        response = await fetch(`${API_BASE_URL}/api/v1/chatbot/chat`, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody)
        });
      } catch (refreshError) {
        dispatch(clearCredentials());
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send message');
    }

    const data = await response.json() as ChatResponse;
    
    // Handle message limit for anonymous users
    if (data.limit_reached) {
      dispatch(incrementMessageCount()); // Update message count and set limit reached
      return data;
    }

    // Increment message count for anonymous users
    if (!auth.token) {
      dispatch(incrementMessageCount());
    }

    // Set current chat ID for new conversations
    if (!chatId && data.chat_id !== "limit_reached") {
      dispatch(setCurrentChat(data.chat_id));
    }
    
    return {
      ...data,
      message,
      attachments
    };
  }
);

// Async thunk to fetch message history for a specific chat
export const fetchChatHistory = createAsyncThunk(
  'chat/fetchChatHistory',
  async (chatId: string, { getState, dispatch }) => {
    const { auth } = getState() as { auth: { token: string; refreshToken: string } };
    let response = await fetch(`${API_BASE_URL}/api/v1/chat/chats/${chatId}/messages`, {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
      },
    });

    // Handle token expiration by attempting to refresh
    if (response.status === 401 && auth.refreshToken) {
      try {
        await refreshToken(auth.refreshToken, dispatch as AppDispatch);
        const newState = getState() as { auth: { token: string } };
        response = await fetch(`${API_BASE_URL}/api/v1/chat/chats/${chatId}/messages`, {
          headers: {
            'Authorization': `Bearer ${newState.auth.token}`
          }
        });
      } catch (refreshError) {
        dispatch(clearCredentials());
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      throw new Error('Failed to fetch chat history');
    }
    return response.json() as Promise<Message[]>;
  }
);

// Initial state for the chat slice
const initialState: ChatState = {
  chats: [],              // List of all chats
  currentChat: {          // Currently selected chat
    id: null,
    messages: [],
  },
  loading: false,         // Loading state for async operations
  error: null,           // Error state for failed operations
};

// Create the chat slice with reducers and extra reducers for async actions
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Set the current chat ID and clear messages
    setCurrentChat: (state, action) => {
      state.currentChat.id = action.payload;
      state.currentChat.messages = [];
    },
    // Clear the current chat state
    clearCurrentChat: (state) => {
      state.currentChat.id = null;
      state.currentChat.messages = [];
    },
    // Initialize a shared chat with all messages at once
    initializeSharedChat: (state, action) => {
      const { chatId, messages } = action.payload;
      state.currentChat.id = chatId;
      state.currentChat.messages = messages;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchChats states
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch chats';
      })
      // Handle sendMessage states
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        // Don't update state if message limit is reached
        if (action.payload.limit_reached) {
          return;
        }
        // Set chat ID for new conversations
        if (!state.currentChat.id) {
          state.currentChat.id = action.payload.chat_id;
        }
        
        // Get the message and attachments with proper typing
        const { message, attachments } = action.payload as ExtendedChatResponse;
        
        // Add user message and bot response to the current chat
        state.currentChat.messages.push(
          { 
            id: Date.now().toString(), 
            chat_id: action.payload.chat_id, 
            content: message, 
            role: 'human', 
            created_at: new Date().toISOString(),
            // Include attachments if present
            attachments: attachments?.length ? 
              attachments.map((a: Attachment) => ({ 
                id: a.id, 
                file_name: a.file_name, 
                file_type: a.file_type 
              })) : undefined 
          },
          { 
            id: (Date.now() + 1).toString(), 
            chat_id: action.payload.chat_id, 
            content: action.payload.answer, 
            role: 'assistant', 
            created_at: new Date().toISOString(), 
            sources: action.payload.sources 
          }
        );
        
        // Add new chat to the list if it doesn't exist
        if (!state.chats.some(chat => chat.id === action.payload.chat_id)) {
          const now = new Date().toISOString();
          state.chats.push({ 
            id: action.payload.chat_id, 
            title: message.slice(0, 30) + '...', 
            created_at: now, 
            updated_at: now 
          });
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send message';
      })
      // Handle fetchChatHistory states
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChat.messages = action.payload;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch chat history';
      });
  },
});

export const { setCurrentChat, clearCurrentChat, initializeSharedChat } = chatSlice.actions;
export default chatSlice.reducer;