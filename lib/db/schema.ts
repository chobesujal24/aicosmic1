export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  isAnonymous: boolean;
  name?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  userId: string;
  visibility: "public" | "private";
  createdAt: Date;
}

export interface DBMessage {
  id: string;
  chatId: string;
  role: string;
  parts: any;
  attachments: any;
  createdAt: Date;
}

export interface Vote {
  chatId: string;
  messageId: string;
  isUpvoted: boolean;
}

export interface Document {
  id: string;
  title: string;
  kind: "text" | "code" | "image" | "sheet";
  content?: string | null;
  userId: string;
  createdAt: Date;
}

export interface Suggestion {
  id: string;
  documentId: string;
  documentCreatedAt: Date;
  originalText: string;
  suggestedText: string;
  description?: string | null;
  isResolved: boolean;
  userId: string;
  createdAt: Date;
}

export interface Stream {
  id: string;
  chatId: string;
  createdAt: Date;
}
