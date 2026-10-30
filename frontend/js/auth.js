document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.querySelector('#register-form');
  const loginForm = document.querySelector('#login-form');
  document.querySelectorAll('[data-toggle-password]').forEach(btn => btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.togglePassword);
    input.type = input.type === 'password' ? 'text' : 'password';
    btn.textContent = input.type === 'password' ? 'Show' : 'Hide';
  }));
  const password = document.querySelector('#password');
  const strength = document.querySelector('#password-strength');
  password?.addEventListener('input', () => {
    const p = password.value;
    const score = [p.length >= 12, /[A-Z]/.test(p), /[a-z]/.test(p), /\d/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
    if (strength) strength.textContent = score < 3 ? 'Weak' : score < 5 ? 'Good' : 'Strong';
    if (strength) strength.dataset.level = score < 3 ? 'weak' : score < 5 ? 'good' : 'strong';
  });
  registerForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const form = new FormData(registerForm);
    const data = Object.fromEntries(form.entries());
    if (data.password !== data.confirmPassword) return toast('Passwords do not match.', 'error');
    if (!form.get('terms')) return toast('Please accept the terms and conditions.', 'error');
    delete data.confirmPassword; delete data.terms;
    const submit = registerForm.querySelector('[type=submit]'); submit.disabled = true; submit.textContent = 'Creating account…';
    try {
      await PortalAPI.post('/auth/register', data);
      toast('Account created. Opening your dashboard…', 'success');
      location.href = 'dashboard.html';
    } catch (err) { toast(err.message, 'error'); }
    finally { submit.disabled = false; submit.textContent = 'Create account'; }
  });
  loginForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(loginForm).entries());
    const submit = loginForm.querySelector('[type=submit]'); submit.disabled = true; submit.textContent = 'Signing in…';
    try {
      await PortalAPI.post('/auth/login', data);
      location.href = 'dashboard.html';
    } catch (err) { toast(err.message, 'error'); }
    finally { submit.disabled = false; submit.textContent = 'Sign in'; }
  });
});
