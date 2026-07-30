document.getElementById('createBtn').addEventListener('click', async () => {
  const res = await fetch('/api/lists', { method: 'POST' });
  const { url } = await res.json();
  window.location.href = url;
});
