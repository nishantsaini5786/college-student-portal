document.addEventListener('DOMContentLoaded', async () => {
  if (!document.body.dataset.protected || document.body.dataset.protected !== 'admin') return;
  const form = document.querySelector('#admin-login-form');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    try { await PortalAPI.post('/auth/admin/login', data); location.href = 'admin.html'; }
    catch (err) { toast(err.message, 'error'); }
  });
  if (document.querySelector('#admin-student-table')) {
    try {
      const data = await PortalAPI.get('/admin/students');
      $('#admin-count').textContent = data.total;
      $('#admin-student-table').innerHTML = data.records.map(s => `<tr><td>${escapeHTML(s.enrollmentNumber)}</td><td>${escapeHTML(s.firstName)} ${escapeHTML(s.lastName)}</td><td>${escapeHTML(s.email)}</td><td>${escapeHTML(s.course)}</td><td>${escapeHTML(s.batch)}</td><td>${escapeHTML(s.status)}</td></tr>`).join('');
    } catch (err) { toast(err.message, 'error'); location.href = 'admin-login.html'; }
  }
  $('#admin-logout')?.addEventListener('click', async () => { await PortalAPI.post('/auth/logout', {}); location.href = 'index.html'; });
});
