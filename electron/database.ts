import Database from 'better-sqlite3';
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

export interface DBConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface DBMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export class DatabaseManager {
  private db: Database.Database;

  constructor() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'studynest.db');
    
    const dbExists = fs.existsSync(dbPath);
    this.db = new Database(dbPath);
    
    if (!dbExists) {
      this.initializeDatabase();
    }
  }

  private initializeDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversationId TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversationId);
      CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updatedAt DESC);
    `);
  }

  getAllConversations(): DBConversation[] {
    const stmt = this.db.prepare(`
      SELECT id, title, createdAt, updatedAt 
      FROM conversations 
      ORDER BY updatedAt DESC
    `);
    return stmt.all() as DBConversation[];
  }

  getConversation(id: string): DBConversation | undefined {
    const stmt = this.db.prepare(`
      SELECT id, title, createdAt, updatedAt 
      FROM conversations 
      WHERE id = ?
    `);
    return stmt.get(id) as DBConversation | undefined;
  }

  createConversation(conversation: DBConversation): void {
    const stmt = this.db.prepare(`
      INSERT INTO conversations (id, title, createdAt, updatedAt)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(conversation.id, conversation.title, conversation.createdAt, conversation.updatedAt);
  }

  updateConversation(id: string, title: string, updatedAt: number): void {
    const stmt = this.db.prepare(`
      UPDATE conversations 
      SET title = ?, updatedAt = ?
      WHERE id = ?
    `);
    stmt.run(title, updatedAt, id);
  }

  deleteConversation(id: string): void {
    const deleteMessages = this.db.prepare('DELETE FROM messages WHERE conversationId = ?');
    const deleteConv = this.db.prepare('DELETE FROM conversations WHERE id = ?');
    
    const transaction = this.db.transaction(() => {
      deleteMessages.run(id);
      deleteConv.run(id);
    });
    
    transaction();
  }

  getMessages(conversationId: string): DBMessage[] {
    const stmt = this.db.prepare(`
      SELECT id, conversationId, role, content, timestamp
      FROM messages
      WHERE conversationId = ?
      ORDER BY timestamp ASC
    `);
    return stmt.all(conversationId) as DBMessage[];
  }

  createMessage(message: DBMessage): void {
    const stmt = this.db.prepare(`
      INSERT INTO messages (id, conversationId, role, content, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(message.id, message.conversationId, message.role, message.content, message.timestamp);
  }

  getConversationWithMessages(id: string): { conversation: DBConversation; messages: DBMessage[] } | null {
    const conversation = this.getConversation(id);
    if (!conversation) return null;
    
    const messages = this.getMessages(id);
    return { conversation, messages };
  }

  close(): void {
    this.db.close();
  }
}
