import initSqlJs, { Database } from 'sql.js';
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
  private db: Database | null = null;
  private dbPath: string;
  private SQL: any;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'studynest.db');
  }

  async initialize(): Promise<void> {
    try {
      let wasmPath: string;
      
      if (app.isPackaged) {
        // In packaged app, WASM is in app.asar.unpacked
        wasmPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
      } else {
        // In development, WASM is in node_modules
        wasmPath = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
      }
      
      console.log('Initializing database...');
      console.log('App packaged:', app.isPackaged);
      console.log('Resources path:', process.resourcesPath);
      console.log('WASM path:', wasmPath);
      console.log('WASM exists:', fs.existsSync(wasmPath));
      console.log('DB path:', this.dbPath);
      
      this.SQL = await initSqlJs({
        locateFile: (file) => {
          console.log('locateFile called for:', file);
          return wasmPath;
        }
      });
      
      console.log('SQL.js initialized successfully');
      
      if (fs.existsSync(this.dbPath)) {
        const buffer = fs.readFileSync(this.dbPath);
        this.db = new this.SQL.Database(buffer);
        console.log('Loaded existing database');
      } else {
        this.db = new this.SQL.Database();
        this.initializeDatabase();
        this.saveDatabase();
        console.log('Created new database');
      }
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  private saveDatabase(): void {
    if (!this.db) return;
    const data = this.db.export();
    fs.writeFileSync(this.dbPath, data);
  }

  private initializeDatabase(): void {
    if (!this.db) return;
    this.db.run(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `);
    this.db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversationId TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
      )
    `);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversationId)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updatedAt DESC)`);
  }

  getAllConversations(): DBConversation[] {
    if (!this.db) return [];
    const result = this.db.exec(`
      SELECT id, title, createdAt, updatedAt 
      FROM conversations 
      ORDER BY updatedAt DESC
    `);
    if (result.length === 0) return [];
    return result[0].values.map((row: any) => ({
      id: row[0] as string,
      title: row[1] as string,
      createdAt: row[2] as number,
      updatedAt: row[3] as number
    }));
  }

  getConversation(id: string): DBConversation | undefined {
    if (!this.db) return undefined;
    const result = this.db.exec(`
      SELECT id, title, createdAt, updatedAt 
      FROM conversations 
      WHERE id = ?
    `, [id]);
    if (result.length === 0 || result[0].values.length === 0) return undefined;
    const row = result[0].values[0];
    return {
      id: row[0] as string,
      title: row[1] as string,
      createdAt: row[2] as number,
      updatedAt: row[3] as number
    };
  }

  createConversation(conversation: DBConversation): void {
    if (!this.db) return;
    this.db.run(`
      INSERT INTO conversations (id, title, createdAt, updatedAt)
      VALUES (?, ?, ?, ?)
    `, [conversation.id, conversation.title, conversation.createdAt, conversation.updatedAt]);
    this.saveDatabase();
  }

  updateConversation(id: string, title: string, updatedAt: number): void {
    if (!this.db) return;
    this.db.run(`
      UPDATE conversations 
      SET title = ?, updatedAt = ?
      WHERE id = ?
    `, [title, updatedAt, id]);
    this.saveDatabase();
  }

  deleteConversation(id: string): void {
    if (!this.db) return;
    this.db.run('DELETE FROM messages WHERE conversationId = ?', [id]);
    this.db.run('DELETE FROM conversations WHERE id = ?', [id]);
    this.saveDatabase();
  }

  getMessages(conversationId: string): DBMessage[] {
    if (!this.db) return [];
    const result = this.db.exec(`
      SELECT id, conversationId, role, content, timestamp
      FROM messages
      WHERE conversationId = ?
      ORDER BY timestamp ASC
    `, [conversationId]);
    if (result.length === 0) return [];
    return result[0].values.map((row: any) => ({
      id: row[0] as string,
      conversationId: row[1] as string,
      role: row[2] as 'user' | 'assistant' | 'system',
      content: row[3] as string,
      timestamp: row[4] as number
    }));
  }

  createMessage(message: DBMessage): void {
    if (!this.db) return;
    this.db.run(`
      INSERT INTO messages (id, conversationId, role, content, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `, [message.id, message.conversationId, message.role, message.content, message.timestamp]);
    this.saveDatabase();
  }

  getConversationWithMessages(id: string): { conversation: DBConversation; messages: DBMessage[] } | null {
    const conversation = this.getConversation(id);
    if (!conversation) return null;
    
    const messages = this.getMessages(id);
    return { conversation, messages };
  }

  close(): void {
    if (this.db) {
      this.saveDatabase();
      this.db.close();
      this.db = null;
    }
  }
}
