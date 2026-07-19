import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  endBefore,
  writeBatch,
} from "firebase/firestore";
import { firebaseDb } from "../firebase";
import type { User, Chat, DBMessage, Vote, Document, Suggestion } from "./schema";

// Helper to convert Firestore timestamps
function parseDoc<T>(doc: any): T {
  const data = doc.data();
  if (data.createdAt && data.createdAt.toDate) {
    data.createdAt = data.createdAt.toDate();
  }
  if (data.updatedAt && data.updatedAt.toDate) {
    data.updatedAt = data.updatedAt.toDate();
  }
  return data as T;
}

export async function getUser(email: string): Promise<User[]> {
  const usersRef = collection(firebaseDb, "users");
  const q = query(usersRef, where("email", "==", email));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(parseDoc<User>);
}

export async function createUser(email: string, password?: string) {
  const id = Math.random().toString(36).substring(7);
  const newUser: User = {
    id,
    email,
    emailVerified: false,
    isAnonymous: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await setDoc(doc(firebaseDb, "users", id), newUser);
}

export async function saveChat({ id, userId, title }: { id: string; userId: string; title: string }) {
  const chatRef = doc(firebaseDb, "chats", id);
  const newChat = {
    id,
    userId,
    title,
    visibility: 'private',
    createdAt: new Date(),
  };
  await setDoc(chatRef, newChat, { merge: true });
}

export async function deleteChatById({ id }: { id: string }) {
  await deleteDoc(doc(firebaseDb, "chats", id));
  
  // Clean up related data (batch)
  const batch = writeBatch(firebaseDb);
  
  const messagesQ = query(collection(firebaseDb, "messages"), where("chatId", "==", id));
  const mSnap = await getDocs(messagesQ);
  mSnap.docs.forEach((d) => batch.delete(d.ref));
  
  const votesQ = query(collection(firebaseDb, "votes"), where("chatId", "==", id));
  const vSnap = await getDocs(votesQ);
  vSnap.docs.forEach((d) => batch.delete(d.ref));
  
  await batch.commit();
}

export async function getChatsByUserId({ id, limit, startingAfter, endingBefore }: { id: string; limit?: number; startingAfter?: string | null; endingBefore?: string | null }) {
  const chatsRef = collection(firebaseDb, "chats");
  let qArgs: any[] = [where("userId", "==", id), orderBy("createdAt", "desc")];
  
  if (limit) qArgs.push(firestoreLimit(limit));
  
  if (startingAfter) {
    const startDoc = await getDoc(doc(firebaseDb, "chats", startingAfter));
    if (startDoc.exists()) qArgs.push(startAfter(startDoc));
  } else if (endingBefore) {
    const endDoc = await getDoc(doc(firebaseDb, "chats", endingBefore));
    if (endDoc.exists()) qArgs.push(endBefore(endDoc));
  }
  
  const q = query(chatsRef, ...qArgs);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(parseDoc<Chat>);
}

export async function getChatById({ id }: { id: string }) {
  const docRef = await getDoc(doc(firebaseDb, "chats", id));
  return docRef.exists() ? parseDoc<Chat>(docRef) : null;
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
  const batch = writeBatch(firebaseDb);
  for (const msg of messages) {
    const msgRef = doc(firebaseDb, "messages", msg.id);
    batch.set(msgRef, { ...msg, createdAt: new Date(msg.createdAt) });
  }
  await batch.commit();
}

export async function getMessagesByChatId({ id }: { id: string }) {
  const msgQ = query(collection(firebaseDb, "messages"), where("chatId", "==", id), orderBy("createdAt", "asc"));
  const snapshot = await getDocs(msgQ);
  return snapshot.docs.map(parseDoc<DBMessage>);
}

export async function voteMessage({ chatId, messageId, type }: { chatId: string; messageId: string; type: 'up' | 'down' }) {
  const voteId = `${chatId}_${messageId}`;
  const voteRef = doc(firebaseDb, "votes", voteId);
  await setDoc(voteRef, {
    chatId,
    messageId,
    isUpvoted: type === 'up'
  }, { merge: true });
}

export async function getVotesByChatId({ id }: { id: string }) {
  const voteQ = query(collection(firebaseDb, "votes"), where("chatId", "==", id));
  const snapshot = await getDocs(voteQ);
  return snapshot.docs.map(parseDoc<Vote>);
}

export async function saveDocument({ id, title, kind, content, userId }: { id: string; title: string; kind: "text" | "code" | "image" | "sheet"; content: string; userId: string; }) {
  const docRef = doc(firebaseDb, "documents", id);
  await setDoc(docRef, {
    id, title, kind, content, userId, createdAt: new Date()
  }, { merge: true });
}

export async function updateDocumentContent({ id, content }: { id: string; content: string }) {
  const docRef = doc(firebaseDb, "documents", id);
  await updateDoc(docRef, { content });
  const updated = await getDoc(docRef);
  return parseDoc<Document>(updated);
}

export async function getDocumentById({ id }: { id: string }) {
  const docRef = await getDoc(doc(firebaseDb, "documents", id));
  return docRef.exists() ? parseDoc<Document>(docRef) : null;
}

export async function getDocumentsById({ id }: { id: string }) {
  const docQ = query(collection(firebaseDb, "documents"), where("id", "==", id));
  const snapshot = await getDocs(docQ);
  return snapshot.docs.map(parseDoc<Document>);
}

export async function deleteDocumentsByIdAfterTimestamp({ id, timestamp }: { id: string; timestamp: Date }) {
  const docQ = query(collection(firebaseDb, "documents"), where("id", "==", id), where("createdAt", ">", new Date(timestamp)));
  const snapshot = await getDocs(docQ);
  const batch = writeBatch(firebaseDb);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function saveSuggestions({ suggestions }: { suggestions: Suggestion[] }) {
  const batch = writeBatch(firebaseDb);
  for (const sug of suggestions) {
    batch.set(doc(firebaseDb, "suggestions", sug.id), sug);
  }
  await batch.commit();
}

export async function getSuggestionsByDocumentId({ documentId }: { documentId: string }) {
  const sugQ = query(collection(firebaseDb, "suggestions"), where("documentId", "==", documentId));
  const snapshot = await getDocs(sugQ);
  return snapshot.docs.map(parseDoc<Suggestion>);
}

export async function getSuggestionById({ id }: { id: string }) {
  const sugRef = await getDoc(doc(firebaseDb, "suggestions", id));
  return sugRef.exists() ? parseDoc<Suggestion>(sugRef) : null;
}

export async function deleteMessagesByChatIdAfterTimestamp({ chatId, timestamp }: { chatId: string; timestamp: Date }) {
  const msgQ = query(collection(firebaseDb, "messages"), where("chatId", "==", chatId), where("createdAt", ">", new Date(timestamp)));
  const snapshot = await getDocs(msgQ);
  const batch = writeBatch(firebaseDb);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function getMessageById({ id }: { id: string }) {
  const msgRef = await getDoc(doc(firebaseDb, "messages", id));
  return msgRef.exists() ? parseDoc<DBMessage>(msgRef) : null;
}

export async function updateChatTitleById({ id, title }: { id: string; title: string }) {
  const chatRef = doc(firebaseDb, "chats", id);
  await updateDoc(chatRef, { title });
}

export async function updateChatVisibilityById({ id, visibility }: { id: string; visibility: 'private' | 'public' }) {
  const chatRef = doc(firebaseDb, "chats", id);
  await updateDoc(chatRef, { visibility });
}

export async function createStreamId({ chatId }: { chatId: string }) {
  const id = Math.random().toString(36).substring(7);
  await setDoc(doc(firebaseDb, "streams", id), {
    id, chatId, createdAt: new Date()
  });
  return id;
}

export async function getMessageCountByUserId({ id }: { id: string }) {
  const chatsQ = query(collection(firebaseDb, "chats"), where("userId", "==", id));
  const chatsSnap = await getDocs(chatsQ);
  const chatIds = chatsSnap.docs.map(d => d.id);
  
  if (chatIds.length === 0) return 0;
  
  let totalMessages = 0;
  for (let i = 0; i < chatIds.length; i += 10) {
    const chunk = chatIds.slice(i, i + 10);
    const msgQ = query(collection(firebaseDb, "messages"), where("chatId", "in", chunk));
    const msgSnap = await getDocs(msgQ);
    totalMessages += msgSnap.docs.length;
  }
  
  return totalMessages;
}

export async function updateMessage({ id, parts }: { id: string; parts: any }) {
  const msgRef = doc(firebaseDb, "messages", id);
  await updateDoc(msgRef, { parts });
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  const chatsQ = query(collection(firebaseDb, "chats"), where("userId", "==", userId));
  const chatsSnap = await getDocs(chatsQ);
  
  for (const docSnapshot of chatsSnap.docs) {
    await deleteChatById({ id: docSnapshot.id });
  }
  return { success: true };
}
