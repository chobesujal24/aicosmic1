import fs from 'fs';
import path from 'path';
import type { User, Chat, DBMessage, Vote, Document, Suggestion, Stream } from './schema';

const DATA_FILE = path.join(process.cwd(), '.data.json');

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

function readData(): DataStore {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return defaultData;
  }
}

function writeData(data: DataStore) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export const db = {
  get: readData,
  set: writeData,
};
