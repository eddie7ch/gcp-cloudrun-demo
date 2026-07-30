import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createList, listExists, getTodos, addTodo, toggleTodo, deleteTodo } from './lib/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cloud Run injects PORT; must listen on it.
const PORT = process.env.PORT || 8080;

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from Cloud Run!', service: 'gcp-cloudrun-demo' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Create a new shareable todo list
app.post('/api/lists', (req, res) => {
  const id = createList();
  res.status(201).json({ id, url: `/l/${id}` });
});

app.get('/api/lists/:id', (req, res) => {
  if (!listExists(req.params.id)) return res.status(404).json({ error: 'list not found' });
  res.json({ id: req.params.id });
});

app.get('/api/lists/:id/todos', (req, res) => {
  if (!listExists(req.params.id)) return res.status(404).json({ error: 'list not found' });
  res.json(getTodos(req.params.id));
});

app.post('/api/lists/:id/todos', (req, res) => {
  if (!listExists(req.params.id)) return res.status(404).json({ error: 'list not found' });
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }
  res.status(201).json(addTodo(req.params.id, text.trim()));
});

app.patch('/api/lists/:id/todos/:todoId', (req, res) => {
  const result = toggleTodo(req.params.id, req.params.todoId);
  if (!result) return res.status(404).json({ error: 'todo not found' });
  res.json(result);
});

app.delete('/api/lists/:id/todos/:todoId', (req, res) => {
  const ok = deleteTodo(req.params.id, req.params.todoId);
  if (!ok) return res.status(404).json({ error: 'todo not found' });
  res.status(204).end();
});

// Serve the list SPA page for any shareable list URL
app.get('/l/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'list.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

