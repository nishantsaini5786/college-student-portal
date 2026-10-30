document.addEventListener('DOMContentLoaded', async () => {
  if (!document.body.dataset.protected) return;
  try {
    const { student: s } = await PortalAPI.get('/student/me');
    const fields = ['firstName','lastName','email','dob','gender','fatherName','motherName','parentMobile','alternativeParentContact','mobile','address','alternativeAddress','course','batch','admissionYear','currentSemester','academicSession','enrollmentNumber'];
    fields.forEach(k => {
      const el = document.querySelector(`[data-profile="${k}"]`);
      if (el) el.textContent = k === 'dob' ? new Date(s[k]).toLocaleDateString() : (s[k] ?? '—');
    });
    const form = document.querySelector('#profile-edit');
    form?.querySelectorAll('[name]').forEach(el => { el.value = s[el.name] || ''; });
    form?.addEventListener('submit', async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      try { await PortalAPI.patch('/student/me', data); toast('Profile updated.', 'success'); }
      catch (err) { toast(err.message, 'error'); }
    });
  } catch (err) { toast(err.message, 'error'); location.href = 'login.html'; }
});
