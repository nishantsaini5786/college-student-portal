document.addEventListener('DOMContentLoaded', async () => {
  const protectedPage = document.body.dataset.protected === 'student';
  if (!protectedPage) return;
  try {
    const data = await PortalAPI.get('/student/dashboard');
    const s = data.student;
    $('#welcome-name').textContent = s.firstName;
    $('#student-name').textContent = `${s.firstName} ${s.lastName}`;
    $('#student-id').textContent = s.enrollmentNumber || '—';
    $('#student-course').textContent = s.course || '—';
    $('#student-batch').textContent = s.batch || '—';
    $('#student-semester').textContent = `Semester ${s.currentSemester}`;
    $('#student-session').textContent = s.academicSession || '—';
    $('#attendance-value').textContent = data.attendance.percentage == null ? 'No data' : `${data.attendance.percentage}%`;
    $('#attendance-detail').textContent = `${data.attendance.classesAttended} of ${data.attendance.classesHeld} classes attended`;
    $('#attendance-bar').style.width = `${data.attendance.percentage || 0}%`;
    $('#fees-pending').textContent = `₹${data.fees.pending.toLocaleString('en-IN')}`;
    $('#fees-detail').textContent = `₹${data.fees.paid.toLocaleString('en-IN')} paid`;
    $('#result-count').textContent = data.results.length;
    $('#exam-list').innerHTML = data.examinations.length ? data.examinations.map(x => `<div class="list-row"><div><b>${escapeHTML(x.subjectName || 'Examination')}</b><small>${escapeHTML(x.subjectCode || '')} · ${escapeHTML(x.hall || 'Venue to be announced')}</small></div><span>${x.examDate ? new Date(x.examDate).toLocaleDateString() : 'Date TBA'}</span></div>`).join('') : '<p class="empty">No examination schedule has been published yet.</p>';
    $('#notice-list').innerHTML = data.announcements.length ? data.announcements.map(x => `<article class="notice"><b>${escapeHTML(x.title)}</b><p>${escapeHTML(x.message)}</p><small>${new Date(x.publishedAt).toLocaleDateString()}</small></article>`).join('') : '<p class="empty">No announcements yet.</p>';
  } catch (err) {
    toast(err.message, 'error');
    if (err.message.toLowerCase().includes('log in') || err.message.toLowerCase().includes('session')) location.href = 'login.html';
  }
  $('#logout')?.addEventListener('click', async () => {
    try { await PortalAPI.post('/auth/logout', {}); location.href = 'index.html'; }
    catch (err) { toast(err.message, 'error'); }
  });
});
