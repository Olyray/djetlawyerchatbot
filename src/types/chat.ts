export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  content: string;
  role: 'human' | 'assistant';
  created_at: string;
}

export interface ChatResponse {
  chat_id: string;
  answer: string;
  sources: Source[];
}

export interface Source {
  url: string;
}

export interface ChatState {
  chats: Chat[];
  currentChat: {
    id: string | null;
    messages: Message[];
  };
  loading: boolean;
  error: string | null;
}

export interface ChatAreaProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
  isSending: boolean;
  pendingMessage: string | null;
  isMobile: boolean;
}

export interface InputAreaProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
  isSending: boolean;
  isMobile: boolean;
}

export interface SuggestedQuestionsProps {
  setInputMessage: (message: string) => void;
}