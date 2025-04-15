export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size?: number;
}

export interface Message {
  id: string;
  chat_id: string;
  content: string;
  role: 'human' | 'assistant';
  created_at: string;
  sources?: Source[];
  attachments?: Attachment[];
  audio_file?: File;
}

export interface ChatResponse {
  chat_id: string;
  answer: string;
  sources: Source[];
  limit_reached?: boolean;
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
  setShowLimitModal?: (fn: () => void) => void;
  hideShareButton?: boolean;
  attachments?: Attachment[];
  onAddAttachment?: (id: string, fileName: string, fileType: string) => void;
  onRemoveAttachment?: (id: string) => void;
  onAddAudioMessage?: (audioFile: File) => void;
}

export interface InputAreaProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
  isSending: boolean;
  isMobile: boolean;
  attachments?: Attachment[];
  onAddAttachment?: (id: string, fileName: string, fileType: string) => void;
  onRemoveAttachment?: (id: string) => void;
  onAddAudioMessage?: (audioFile: File) => void;
}

export interface SuggestedQuestionsProps {
  setInputMessage: (message: string) => void;
}