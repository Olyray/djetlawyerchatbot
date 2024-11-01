import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Chat, Message, ChatResponse, ChatState } from '../../types/chat';
import { API_BASE_URL } from '../../utils/config';
import { refreshToken } from '../../utils/tokenManager';
import { clearCredentials } from './authSlice';
import { store } from '../store'; 

export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async (_, { getState }) => {
    const { auth } = getState() as { auth: { token: string; refreshToken: string } };
    let response = await fetch(`${API_BASE_URL}/api/v1/chat/chats`, {
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    });

    if (response.status === 401 && auth.refreshToken) {
      console.log('Refreshing token...');
      try {
        await refreshToken(auth.refreshToken, store.dispatch);
        const newState = getState() as { auth: { token: string } };
        response = await fetch(`${API_BASE_URL}/api/v1/chat/chats`, {
          headers: {
            'Authorization': `Bearer ${newState.auth.token}`
          }
        });
      } catch (refreshError) {
        store.dispatch(clearCredentials());
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }
    return response.json();
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, chatId }: { message: string; chatId?: string }, { getState, dispatch }) => {
    const { auth } = getState() as { auth: { token: string } };
    const response = await fetch(`${API_BASE_URL}/api/v1/chatbot/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, chat_id: chatId }),
    });
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    const data = await response.json() as ChatResponse;
    if (!chatId) {
      dispatch(setCurrentChat(data.chat_id));
    }
    
    return data;
  }
);

export const fetchChatHistory = createAsyncThunk(
  'chat/fetchChatHistory',
  async (chatId: string, { getState }) => {
    const { auth } = getState() as { auth: { token: string } };
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/chats/${chatId}/messages`, {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch chat history');
    }
    return response.json() as Promise<Message[]>;
  }
);

const initialState: ChatState = {
  chats: [],
  currentChat: {
    id: null,
    messages: [],
  },
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChat.id = action.payload;
      state.currentChat.messages = [];
    },
    clearCurrentChat: (state) => {
      state.currentChat.id = null;
      state.currentChat.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.currentChat.id) {
          state.currentChat.id = action.payload.chat_id;
        }
        state.currentChat.messages.push(
          { id: Date.now().toString(), chat_id: action.payload.chat_id, content: action.meta.arg.message, role: 'human', created_at: new Date().toISOString() },
          { id: (Date.now() + 1).toString(), chat_id: action.payload.chat_id, content: action.payload.answer, role: 'assistant', created_at: new Date().toISOString(), sources: action.payload.sources }
        );
        if (!state.chats.some(chat => chat.id === action.payload.chat_id)) {
          const now = new Date().toISOString();
          state.chats.push({ id: action.payload.chat_id, title: action.meta.arg.message.slice(0, 30) + '...', created_at: now, updated_at: now });
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send message';
      })
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

export const { setCurrentChat, clearCurrentChat } = chatSlice.actions;
export default chatSlice.reducer;