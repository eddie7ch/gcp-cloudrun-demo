const listId = window.location.pathname.split('/').pop();
const shareLinkInput = document.getElementById('shareLink');
shareLinkInput.value = window.location.href;

document.getElementById('copyBtn').addEventListener('click', async () => {
  const btn = document.getElementById('copyBtn');
  await navigator.clipboard.writeText(shareLinkInput.value);
  const original = btn.textContent;
  btn.textContent = 'Copied!';
  setTimeout(() => (btn.textContent = original), 1500);
});

async function loadTodos() {
  const res = await fetch(`/api/lists/${listId}/todos`);
  if (res.status === 404) {
    document.querySelector('.list').innerHTML = '<p>This list does not exist. <a href="/">Create a new one</a>.</p>';
    return;
  }
  render(await res.json());
}

function render(todos) {
  const ul = document.getElementById('todoList');
  ul.innerHTML = '';
  todos.forEach((todo) => {
    const li = document.createElement('li');
    li.className = todo.done ? 'done' : '';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    const span = document.createElement('span');
    span.textContent = todo.text;

    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.className = 'delete';
    delBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.append(checkbox, span, delBtn);
    ul.appendChild(li);
  });

  const remaining = todos.filter((t) => !t.done).length;
  document.getElementById('progress').textContent = todos.length
    ? `${remaining} of ${todos.length} remaining`
    : 'No todos yet — add one above!';

  document.getElementById('celebration').hidden = !(todos.length > 0 && remaining === 0);
}

document.getElementById('addForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('todoText');
  const text = input.value.trim();
  if (!text) return;
  await fetch(`/api/lists/${listId}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  input.value = '';
  loadTodos();
});

async function toggleTodo(id) {
  await fetch(`/api/lists/${listId}/todos/${id}`, { method: 'PATCH' });
  loadTodos();
}

async function deleteTodo(id) {
  await fetch(`/api/lists/${listId}/todos/${id}`, { method: 'DELETE' });
  loadTodos();
}

loadTodos();
