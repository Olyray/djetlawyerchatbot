import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

interface AnonymousState {
  sessionId: string;
  messageCount: number;
  isLimitReached: boolean;
  lastMessageTimestamp: number | null;
}

// Check if the last message was sent more than 24 hours ago
const shouldResetMessageCount = () => {
  const lastTimestamp = localStorage.getItem('anonymousLastMessageTime');
  if (!lastTimestamp) return false;
  
  const lastTime = parseInt(lastTimestamp, 10);
  const currentTime = Date.now();
  const hoursDifference = (currentTime - lastTime) / (1000 * 60 * 60);
  
  return hoursDifference >= 24;
};

// Get the initial message count, checking for 24-hour reset
const getInitialMessageCount = () => {
  if (typeof window === 'undefined') return 0;
  
  if (shouldResetMessageCount()) {
    // If it's been more than 24 hours, reset the count
    localStorage.removeItem('anonymousMessageCount');
    localStorage.removeItem('anonymousLastMessageTime');
    return 0;
  }
  
  // Otherwise return the stored count or 0
  const storedCount = localStorage.getItem('anonymousMessageCount');
  return storedCount ? parseInt(storedCount, 10) : 0;
};

const initialState: AnonymousState = {
  sessionId: typeof window !== 'undefined' ? localStorage.getItem('anonymousSessionId') || uuidv4() : uuidv4(),
  messageCount: getInitialMessageCount(),
  isLimitReached: typeof window !== 'undefined' ? 
    (localStorage.getItem('anonymousMessageCount') ? 
      parseInt(localStorage.getItem('anonymousMessageCount')!, 10) >= 5 && !shouldResetMessageCount()
      : false)
    : false,
  lastMessageTimestamp: typeof window !== 'undefined' ? 
    parseInt(localStorage.getItem('anonymousLastMessageTime') || '0', 10) || null
    : null,
};

// Save session ID to localStorage when created
if (typeof window !== 'undefined') {
  localStorage.setItem('anonymousSessionId', initialState.sessionId);
}

const anonymousSlice = createSlice({
  name: 'anonymous',
  initialState,
  reducers: {
    incrementMessageCount: (state) => {
      state.messageCount += 1;
      
      // Save the count and timestamp to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('anonymousMessageCount', state.messageCount.toString());
        const now = Date.now();
        localStorage.setItem('anonymousLastMessageTime', now.toString());
        state.lastMessageTimestamp = now;
      }
      
      if (state.messageCount >= 5) {
        state.isLimitReached = true;
        
        // Mark that we're in anonymous mode before login
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('wasAnonymous', 'true');
        }
      }
    },
    resetAnonymousState: (state) => {
      state.messageCount = 0;
      state.isLimitReached = false;
      state.lastMessageTimestamp = null;
      
      // Clear localStorage values related to message count
      if (typeof window !== 'undefined') {
        localStorage.removeItem('anonymousMessageCount');
        localStorage.removeItem('anonymousLastMessageTime');
      }
      
      // We'll keep the same sessionId so that we can access the same anonymous chat history
      // when transferring to an authenticated user
      // state.sessionId = uuidv4();
      
      if (typeof window !== 'undefined') {
        // We'll keep the session ID in localStorage for now to maintain the chat history
        // localStorage.setItem('anonymousSessionId', state.sessionId);
      }
    },
    // Add this action to check for and apply 24-hour resets
    checkMessageCountReset: (state) => {
      if (shouldResetMessageCount()) {
        state.messageCount = 0;
        state.isLimitReached = false;
        state.lastMessageTimestamp = null;
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('anonymousMessageCount');
          localStorage.removeItem('anonymousLastMessageTime');
          sessionStorage.removeItem('wasAnonymous');
        }
      }
    }
  },
});

export const { incrementMessageCount, resetAnonymousState, checkMessageCountReset } = anonymousSlice.actions;
export default anonymousSlice.reducer; 