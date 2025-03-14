import { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { incrementMessageCount, checkMessageCountReset } from '@/redux/slices/anonymousSlice';

export default function useChatbot() {
  // Get token to determine if user is logged in
  const token = useSelector((state: RootState) => state.auth.token);
  const isLimitReached = useSelector((state: RootState) => state.anonymous.isLimitReached);
  const loading = useSelector((state: RootState) => state.chat.loading);
  const messages = useSelector((state: RootState) => 
    state.chat.currentChat?.messages || []);
  const anonymousSessionId = useSelector((state: RootState) => state.anonymous.sessionId);
  const currentChatId = useSelector((state: RootState) => 
    state.chat.currentChat?.id || null);
  const dispatch = useDispatch();
  const [hasSwitchedRoom, setHasSwitchedRoom] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const openLimitModalRef = useRef<() => void>(() => {});
  const setOpenLimitModalFn = useCallback((fn: () => void) => {
    openLimitModalRef.current = fn;
  }, []);

  // Check for message limit reset on component mount
  useEffect(() => {
    dispatch(checkMessageCountReset());
  }, [dispatch]);

  return {
    isLoggedIn: !!token,
    isLimitReached,
    isLoading: loading,
    chats: messages,
    anonymousSessionId,
    currentChatRoomId: currentChatId,
    hasSwitchedRoom,
    setHasSwitchedRoom,
    showLimitModal,
    setShowLimitModal: setOpenLimitModalFn,
    dispatch,
    // Add other properties needed in the return object
  };
} 