import type { User, Chat, DBMessage, Vote, Document, Suggestion } from './schema';
import { db } from './mock-db';

export async function getUser(email: string): Promise<User[]> {
  const data = db.get();
  return data.users.filter(u => u.email === email);
}

export async function createUser(email: string, password?: string) {
  const data = db.get();
  const newUser: User = {
    id: Math.random().toString(36).substring(7),
    email,
    emailVerified: false,
    isAnonymous: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  data.users.push(newUser);
  db.set(data);
}

export async function saveChat({ id, userId, title }: { id: string; userId: string; title: string }) {
  const data = db.get();
  const newChat: Chat = {
    id,
    userId,
    title,
    visibility: 'private',
    createdAt: new Date(),
  };
  const existingIndex = data.chats.findIndex(c => c.id === id);
  if (existingIndex > -1) {
    data.chats[existingIndex] = { ...data.chats[existingIndex], ...newChat };
  } else {
    data.chats.push(newChat);
  }
  db.set(data);
}

export async function deleteChatById({ id }: { id: string }) {
  const data = db.get();
  data.chats = data.chats.filter(c => c.id !== id);
  data.messages = data.messages.filter(m => m.chatId !== id);
  data.votes = data.votes.filter(v => v.chatId !== id);
  db.set(data);
}

export async function getChatsByUserId({ id, limit, startingAfter, endingBefore }: { id: string; limit?: number; startingAfter?: string | null; endingBefore?: string | null }) {
  const data = db.get();
  let chats = data.chats.filter(c => c.userId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  if (limit) chats = chats.slice(0, limit);
  return chats;
}

export async function getChatById({ id }: { id: string }) {
  const data = db.get();
  return data.chats.find(c => c.id === id) || null;
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
  const data = db.get();
  data.messages.push(...messages);
  db.set(data);
}

export async function getMessagesByChatId({ id }: { id: string }) {
  const data = db.get();
  return data.messages.filter(m => m.chatId === id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function voteMessage({ chatId, messageId, type }: { chatId: string; messageId: string; type: 'up' | 'down' }) {
  const data = db.get();
  const isUpvoted = type === 'up';
  const existingVoteIndex = data.votes.findIndex(v => v.chatId === chatId && v.messageId === messageId);
  
  if (existingVoteIndex > -1) {
    data.votes[existingVoteIndex].isUpvoted = isUpvoted;
  } else {
    data.votes.push({ chatId, messageId, isUpvoted });
  }
  db.set(data);
}

export async function getVotesByChatId({ id }: { id: string }) {
  const data = db.get();
  return data.votes.filter(v => v.chatId === id);
}

export async function saveDocument({ id, title, kind, content, userId }: { id: string; title: string; kind: "text" | "code" | "image" | "sheet"; content: string; userId: string; }) {
  const data = db.get();
  const newDoc: Document = { id, title, kind, content, userId, createdAt: new Date() };
  
  const existingIndex = data.documents.findIndex(d => d.id === id);
  if (existingIndex > -1) {
    data.documents[existingIndex] = { ...data.documents[existingIndex], ...newDoc };
  } else {
    data.documents.push(newDoc);
  }
  db.set(data);
}

export async function updateDocumentContent({ id, content }: { id: string; content: string }) {
  const data = db.get();
  const existingIndex = data.documents.findIndex(d => d.id === id);
  if (existingIndex > -1) {
    data.documents[existingIndex].content = content;
    db.set(data);
  }
  return data.documents[existingIndex];
}

export async function getDocumentById({ id }: { id: string }) {
  const data = db.get();
  return data.documents.find(d => d.id === id) || null;
}

export async function getDocumentsById({ id }: { id: string }) {
  const data = db.get();
  return data.documents.filter(d => d.id === id);
}

export async function deleteDocumentsByIdAfterTimestamp({ id, timestamp }: { id: string; timestamp: Date }) {
  const data = db.get();
  data.documents = data.documents.filter(d => !(d.id === id && new Date(d.createdAt) > new Date(timestamp)));
  db.set(data);
}

export async function saveSuggestions({ suggestions }: { suggestions: Suggestion[] }) {
  const data = db.get();
  data.suggestions.push(...suggestions);
  db.set(data);
}

export async function getSuggestionsByDocumentId({ documentId }: { documentId: string }) {
  const data = db.get();
  return data.suggestions.filter(s => s.documentId === documentId);
}

export async function getSuggestionById({ id }: { id: string }) {
  const data = db.get();
  return data.suggestions.find(s => s.id === id) || null;
}

export async function deleteMessagesByChatIdAfterTimestamp({ chatId, timestamp }: { chatId: string; timestamp: Date }) {
  const data = db.get();
  data.messages = data.messages.filter(m => !(m.chatId === chatId && new Date(m.createdAt) > new Date(timestamp)));
  db.set(data);
}

export async function getMessageById({ id }: { id: string }) {
  const data = db.get();
  return data.messages.find(m => m.id === id) || null;
}

export async function updateChatTitleById({ id, title }: { id: string; title: string }) {
  const data = db.get();
  const chatIndex = data.chats.findIndex(c => c.id === id);
  if (chatIndex > -1) {
    data.chats[chatIndex].title = title;
    db.set(data);
  }
}

export async function updateChatVisibilityById({ id, visibility }: { id: string; visibility: 'private' | 'public' }) {
  const data = db.get();
  const chatIndex = data.chats.findIndex(c => c.id === id);
  if (chatIndex > -1) {
    data.chats[chatIndex].visibility = visibility;
    db.set(data);
  }
}

export async function createStreamId({ chatId }: { chatId: string }) {
  const data = db.get();
  const id = Math.random().toString(36).substring(7);
  data.streams = data.streams || [];
  data.streams.push({ id, chatId, createdAt: new Date() });
  db.set(data);
  return id;
}

export async function getMessageCountByUserId({ id }: { id: string }) {
  const data = db.get();
  const userChats = data.chats.filter(c => c.userId === id).map(c => c.id);
  const userMessages = data.messages.filter(m => userChats.includes(m.chatId));
  return userMessages.length;
}

export async function updateMessage({ id, parts }: { id: string; parts: any }) {
  const data = db.get();
  const index = data.messages.findIndex(m => m.id === id);
  if (index > -1) {
    data.messages[index].parts = parts;
    db.set(data);
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  const data = db.get();
  const userChatIds = data.chats.filter(c => c.userId === userId).map(c => c.id);
  data.chats = data.chats.filter(c => c.userId !== userId);
  data.messages = data.messages.filter(m => !userChatIds.includes(m.chatId));
  data.votes = data.votes.filter(v => !userChatIds.includes(v.chatId));
  db.set(data);
  return { success: true };
}
