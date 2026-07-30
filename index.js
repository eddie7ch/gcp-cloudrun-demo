import express from 'express';

const app = express();
app.use(express.json());

// Cloud Run injects PORT; must listen on it.
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Cloud Run!', service: 'gcp-cloudrun-demo' });
});

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const todos = [];

app.get('/todos', (req, res) => {
  res.json(todos);
});

app.post('/todos', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }
  const todo = { id: todos.length + 1, text, done: false };
  todos.push(todo);
  res.status(201).json(todo);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
