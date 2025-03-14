import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import anonymousReducer from './slices/anonymousSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    anonymous: anonymousReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
