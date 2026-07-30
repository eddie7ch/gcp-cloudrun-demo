import { DatabaseSync } from 'node:sqlite';
import { randomBytes } from 'crypto';
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
mkdirSync(dataDir, { recursive: true });

// Uses Node's built-in SQLite module - no native addon/build step required.
const db = new DatabaseSync(path.join(dataDir, 'todos.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS lists (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id TEXT NOT NULL REFERENCES lists(id),
    text TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);

export function createList() {
  const id = randomBytes(4).toString('hex');
  db.prepare('INSERT INTO lists (id, created_at) VALUES (?, ?)').run(id, new Date().toISOString());
  return id;
}

export function listExists(id) {
  return !!db.prepare('SELECT 1 FROM lists WHERE id = ?').get(id);
}

export function getTodos(listId) {
  return db
    .prepare('SELECT id, text, done, created_at FROM todos WHERE list_id = ? ORDER BY id')
    .all(listId)
    .map((t) => ({ ...t, done: !!t.done }));
}

export function addTodo(listId, text) {
  const created_at = new Date().toISOString();
  const info = db
    .prepare('INSERT INTO todos (list_id, text, done, created_at) VALUES (?, ?, 0, ?)')
    .run(listId, text, created_at);
  return { id: info.lastInsertRowid, text, done: false, created_at };
}

export function toggleTodo(listId, todoId) {
  const todo = db.prepare('SELECT done FROM todos WHERE id = ? AND list_id = ?').get(todoId, listId);
  if (!todo) return null;
  const newDone = todo.done ? 0 : 1;
  db.prepare('UPDATE todos SET done = ? WHERE id = ? AND list_id = ?').run(newDone, todoId, listId);
  return { id: Number(todoId), done: !!newDone };
}

export function deleteTodo(listId, todoId) {
  const info = db.prepare('DELETE FROM todos WHERE id = ? AND list_id = ?').run(todoId, listId);
  return info.changes > 0;
}
