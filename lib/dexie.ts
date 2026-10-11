// lib/dexie.ts
import Dexie, { Table } from 'dexie';

export interface StoredFile {
  id?: number;
  sessionId: string;
  fileName: string;
  fileBlob: Blob; // The actual raw binary file
  uploadedAt: Date;
}

export class ResumeDatabase extends Dexie {
  files!: Table<StoredFile>;

  constructor() {
    super('ResumeDatabase');
    this.version(1).stores({
      files: '++id, sessionId, fileName' // Indexes for fast lookup
    });
  }
}

export const db = new ResumeDatabase();