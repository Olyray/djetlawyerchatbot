// Redux slice for managing anonymous user state and message limits
// Handles session tracking, message counting, and 24-hour limit resets
import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Interface defining the state structure for anonymous users
interface AnonymousState {
  sessionId: string;           // Unique identifier for anonymous session
  messageCount: number;        // Number of messages sent in current period
  isLimitReached: boolean;     // Whether user has hit the message limit
  lastMessageTimestamp: number | null;  // Timestamp of last message sent
}

// Helper function to determine if the 24-hour message limit period has elapsed
// Returns true if more than 24 hours have passed since the last message
const shouldResetMessageCount = () => {
  const lastTimestamp = localStorage.getItem('anonymousLastMessageTime');
  if (!lastTimestamp) return false;
  
  const lastTime = parseInt(lastTimestamp, 10);
  const currentTime = Date.now();
  const hoursDifference = (currentTime - lastTime) / (1000 * 60 * 60);
  
  return hoursDifference >= 24;
};

// Helper function to get the initial message count when initializing state
// Handles 24-hour resets and localStorage persistence
const getInitialMessageCount = () => {
  if (typeof window === 'undefined') return 0;  // Handle SSR case
  
  if (shouldResetMessageCount()) {
    // Reset count and timestamps if 24 hours have passed
    localStorage.removeItem('anonymousMessageCount');
    localStorage.removeItem('anonymousLastMessageTime');
    return 0;
  }
  
  // Return existing count from localStorage or 0 if none exists
  const storedCount = localStorage.getItem('anonymousMessageCount');
  return storedCount ? parseInt(storedCount, 10) : 0;
};

// Initial state setup with proper handling of browser vs SSR environment
const initialState: AnonymousState = {
  // Generate or retrieve session ID, handling SSR case
  sessionId: typeof window !== 'undefined' ? localStorage.getItem('anonymousSessionId') || uuidv4() : uuidv4(),
  
  // Get message count with 24-hour reset check
  messageCount: getInitialMessageCount(),
  
  // Determine if limit is reached based on count and reset period
  isLimitReached: typeof window !== 'undefined' ? 
    (localStorage.getItem('anonymousMessageCount') ? 
      parseInt(localStorage.getItem('anonymousMessageCount')!, 10) >= 5 && !shouldResetMessageCount()
      : false)
    : false,
  
  // Get last message timestamp from localStorage
  lastMessageTimestamp: typeof window !== 'undefined' ? 
    parseInt(localStorage.getItem('anonymousLastMessageTime') || '0', 10) || null
    : null,
};

// Persist session ID to localStorage in browser environment
if (typeof window !== 'undefined') {
  localStorage.setItem('anonymousSessionId', initialState.sessionId);
}

// Create the anonymous slice with reducers for managing state
const anonymousSlice = createSlice({
  name: 'anonymous',
  initialState,
  reducers: {
    // Increment message count and handle limit reached state
    incrementMessageCount: (state) => {
      state.messageCount += 1;
      
      // Persist updated count and timestamp to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('anonymousMessageCount', state.messageCount.toString());
        const now = Date.now();
        localStorage.setItem('anonymousLastMessageTime', now.toString());
        state.lastMessageTimestamp = now;
      }
      
      // Check if message limit (5 messages) has been reached
      if (state.messageCount >= 5) {
        state.isLimitReached = true;
        
        // Mark anonymous state for potential login transition
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('wasAnonymous', 'true');
        }
      }
    },

    // Reset anonymous state while preserving session ID
    resetAnonymousState: (state) => {
      state.messageCount = 0;
      state.isLimitReached = false;
      state.lastMessageTimestamp = null;
      
      // Clear message-related localStorage entries
      if (typeof window !== 'undefined') {
        localStorage.removeItem('anonymousMessageCount');
        localStorage.removeItem('anonymousLastMessageTime');
      }
      
      // Note: We keep the same sessionId to maintain chat history
      // when transitioning to authenticated user
      // state.sessionId = uuidv4();
      
      if (typeof window !== 'undefined') {
        // Session ID remains in localStorage to preserve chat history
        // localStorage.setItem('anonymousSessionId', state.sessionId);
      }
    },

    // Check and apply 24-hour message limit reset if needed
    checkMessageCountReset: (state) => {
      if (shouldResetMessageCount()) {
        // Reset all message-related state
        state.messageCount = 0;
        state.isLimitReached = false;
        state.lastMessageTimestamp = null;
        
        // Clear all related storage entries
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