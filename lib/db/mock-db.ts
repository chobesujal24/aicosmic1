import fs from 'fs';
import path from 'path';
import type { User, Chat, DBMessage, Vote, Document, Suggestion, Stream } from './schema';

const DATA_FILE = path.join(process.env.VERCEL ? '/tmp' : process.cwd(), '.data.json');

type DataStore = {
  users: User[];
  chats: Chat[];
  messages: DBMessage[];
  votes: Vote[];
  documents: Document[];
  suggestions: Suggestion[];
  streams: Stream[];
};

const defaultData: DataStore = {
  users: [],
  chats: [],
  messages: [],
  votes: [],
  documents: [],
  suggestions: [],
  streams: [],
};

let memoryCache: DataStore | null = null;

function readData(): DataStore {
  if (memoryCache) return memoryCache as DataStore;
  try {
    if (!fs.existsSync(DATA_FILE)) {
      memoryCache = defaultData;
      writeData(defaultData);
      return memoryCache as DataStore;
    }
    memoryCache = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    return memoryCache as DataStore;
  } catch (e) {
    memoryCache = defaultData;
    return memoryCache as DataStore;
  }
}

function writeData(data: DataStore) {
  memoryCache = data;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    // Ignore Vercel read-only filesystem errors
  }
}

export const db = {
  get: readData,
  set: writeData,
};
