import initSqlJs, { Database } from 'sql.js';
import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';
import { ChatSession, ChatMessage, ChatSessionWithMessages } from './lib/model-types';

export class ChatDatabase {
  private db: Database | null = null;
  private dbPath: string;
  private initialized: boolean = false;

  constructor() {
    // Store database in app's userData directory
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'chat-history.db');
  }

  async initialize() {
    if (this.initialized) return;

    const SQL = await initSqlJs();

    // Try to load existing database
    if (fs.existsSync(this.dbPath)) {
      const buffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(buffer);
    } else {
      this.db = new SQL.Database();
    }

    this.createTables();
    this.saveDatabase();
    this.initialized = true;
  }

  private createTables() {
    if (!this.db) return;

    // Create chat_sessions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Create chat_messages table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (chat_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_messages_chat_id
      ON chat_messages(chat_id)
    `);

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_sessions_updated
      ON chat_sessions(updated_at DESC)
    `);
  }

  private saveDatabase() {
    if (!this.db) return;

    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }

  // Create a new chat session
  async createChatSession(name: string): Promise<ChatSession> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();

    this.db.run(
      'INSERT INTO chat_sessions (name, created_at, updated_at) VALUES (?, ?, ?)',
      [name, now, now]
    );

    const result = this.db.exec('SELECT last_insert_rowid() as id')[0];
    const id = result.values[0][0] as number;

    this.saveDatabase();

    return {
      id,
      name,
      createdAt: now,
      updatedAt: now,
      messageCount: 0
    };
  }

  // Get all chat sessions (ordered by most recent)
  async getAllChatSessions(): Promise<ChatSession[]> {
    await this.initialize();
    if (!this.db) return [];

    const result = this.db.exec(`
      SELECT
        s.id,
        s.name,
        s.created_at as createdAt,
        s.updated_at as updatedAt,
        COUNT(m.id) as messageCount
      FROM chat_sessions s
      LEFT JOIN chat_messages m ON s.id = m.chat_id
      GROUP BY s.id
      ORDER BY s.updated_at DESC
    `);

    if (result.length === 0) return [];

    const sessions: ChatSession[] = [];
    const columns = result[0].columns;
    const values = result[0].values;

    for (const row of values) {
      const session: any = {};
      columns.forEach((col, idx) => {
        session[col] = row[idx];
      });
      sessions.push(session as ChatSession);
    }

    return sessions;
  }

  // Get a specific chat session with all messages
  async getChatSessionWithMessages(chatId: number): Promise<ChatSessionWithMessages | null> {
    await this.initialize();
    if (!this.db) return null;

    // Get chat session
    const sessionResult = this.db.exec(`
      SELECT id, name, created_at as createdAt, updated_at as updatedAt
      FROM chat_sessions
      WHERE id = ?
    `, [chatId]);

    if (sessionResult.length === 0 || sessionResult[0].values.length === 0) {
      return null;
    }

    const sessionRow = sessionResult[0].values[0];
    const session: ChatSession = {
      id: sessionRow[0] as number,
      name: sessionRow[1] as string,
      createdAt: sessionRow[2] as string,
      updatedAt: sessionRow[3] as string
    };

    // Get messages for this chat
    const messagesResult = this.db.exec(`
      SELECT id, chat_id as chatId, role, content, timestamp
      FROM chat_messages
      WHERE chat_id = ?
      ORDER BY timestamp ASC
    `, [chatId]);

    const messages: ChatMessage[] = [];
    if (messagesResult.length > 0) {
      const columns = messagesResult[0].columns;
      const values = messagesResult[0].values;

      for (const row of values) {
        const message: any = {};
        columns.forEach((col, idx) => {
          message[col] = row[idx];
        });
        messages.push(message as ChatMessage);
      }
    }

    return {
      ...session,
      messages
    };
  }

  // Add a message to a chat session
  async addMessage(chatId: number, role: 'user' | 'assistant', content: string): Promise<ChatMessage> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const timestamp = new Date().toISOString();

    // Insert message
    this.db.run(
      'INSERT INTO chat_messages (chat_id, role, content, timestamp) VALUES (?, ?, ?, ?)',
      [chatId, role, content, timestamp]
    );

    const result = this.db.exec('SELECT last_insert_rowid() as id')[0];
    const id = result.values[0][0] as number;

    // Update chat session's updated_at
    this.db.run(
      'UPDATE chat_sessions SET updated_at = ? WHERE id = ?',
      [timestamp, chatId]
    );

    this.saveDatabase();

    return {
      id,
      chatId,
      role,
      content,
      timestamp
    };
  }

  // Update chat session name
  async updateChatSessionName(chatId: number, name: string): Promise<boolean> {
    await this.initialize();
    if (!this.db) return false;

    this.db.run(
      'UPDATE chat_sessions SET name = ?, updated_at = ? WHERE id = ?',
      [name, new Date().toISOString(), chatId]
    );

    this.saveDatabase();
    return true;
  }

  // Delete a chat session (messages will be deleted via CASCADE)
  async deleteChatSession(chatId: number): Promise<boolean> {
    await this.initialize();
    if (!this.db) return false;

    // First delete messages manually (CASCADE doesn't work the same in sql.js)
    this.db.run('DELETE FROM chat_messages WHERE chat_id = ?', [chatId]);
    this.db.run('DELETE FROM chat_sessions WHERE id = ?', [chatId]);

    this.saveDatabase();
    return true;
  }

  // Close database connection
  close() {
    if (this.db) {
      this.saveDatabase();
      this.db.close();
      this.db = null;
    }
  }
}

// Export singleton instance
export const chatDatabase = new ChatDatabase();
