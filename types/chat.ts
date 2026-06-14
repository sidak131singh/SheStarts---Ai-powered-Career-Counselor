export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  careerPath?: string;
  mode: 'counselor' | 'interview' | 'advice';
  messages: ChatMessage[];
  context: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamingResponse {
  id: string;
  content: string;
  isComplete: boolean;
  error?: string;
}
