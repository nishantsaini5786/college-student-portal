(() => {
  const $ = (s, root = document) => root.querySelector(s);
  window.$ = $;
  window.toast = (message, type = 'info') => {
    let host = $('#toast-host');
    if (!host) { host = document.createElement('div'); host.id = 'toast-host'; host.className = 'toast-host'; document.body.append(host); }
    const el = document.createElement('div'); el.className = `toast toast-${type}`; el.textContent = message;
    host.append(el); setTimeout(() => el.remove(), 4200);
  };
  window.escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  const toggle = $('#menu-toggle');
  if (toggle) toggle.addEventListener('click', () => $('#site-nav')?.classList.toggle('open'));
  const theme = localStorage.getItem('portal-theme');
  if (theme === 'dark') document.documentElement.dataset.theme = 'dark';
  $('#theme-toggle')?.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('portal-theme', dark ? 'dark' : 'light');
  });
})();
