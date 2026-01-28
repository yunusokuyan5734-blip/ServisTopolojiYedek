fetch('/api/health', { credentials: 'include' })
  .then(r => {
    if (r.status === 401) location.href = '/index.html';
  });

function logout() {
  fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    .then(() => location.href = '/index.html');
}
