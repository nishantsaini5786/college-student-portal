(() => {
  const base = window.PORTAL_CONFIG.API_BASE_URL.replace(/\/$/, '');
  function readCookie(name) {
    const prefix = name + '=';
    const item = document.cookie.split('; ').find(row => row.startsWith(prefix));
    return item ? decodeURIComponent(item.slice(prefix.length)) : '';
  }
  async function request(path, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (!['GET','HEAD','OPTIONS'].includes(method)) {
      const csrf = readCookie('portal_csrf');
      if (csrf) headers['X-CSRF-Token'] = csrf;
    }
    let response;
    try {
      response = await fetch(base + path, { ...options, method, headers, credentials: 'include' });
    } catch {
      throw new Error('Cannot connect to the server. Check your API URL and backend status.');
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Request failed.');
    return data;
  }
  window.PortalAPI = {
    get: path => request(path),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) })
  };
})();
