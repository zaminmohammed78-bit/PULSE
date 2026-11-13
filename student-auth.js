// js/student-auth.js — Enforces strict teacher-code-only login for students
(async function enforceStudentLogin() {
  const savedCode = localStorage.getItem('auraway_student_code');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Skip lock on dedicated teacher/parent portals
  if (currentPage === 'teacher.html' || currentPage === 'parent.html') return;

  // Inject full-screen login gate if not logged in
  if (!savedCode) {
    showStudentLoginGate();
    return;
  }

  // Re-verify code against Supabase in background
  if (typeof supabaseClient !== 'undefined') {
    const { data, error } = await supabaseClient
      .from('students')
      .select('*')
      .eq('student_code', savedCode)
      .maybeSingle();

    if (!error && !data) {
      // Teacher deleted this student code -> force logout
      localStorage.removeItem('auraway_student_code');
      localStorage.removeItem('auraway_student_profile');
      showStudentLoginGate('Your access code is no longer active. Contact your teacher.');
    } else if (data) {
      localStorage.setItem('auraway_student_profile', JSON.stringify(data));
    }
  }
})();

function showStudentLoginGate(customMsg = '') {
  document.addEventListener('DOMContentLoaded', () => {
    document.body.innerHTML = `
      <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--bg-primary, #0f172a); color:var(--text-primary, #f8fafc); padding:20px; font-family:sans-serif;">
        <div style="max-width:400px; width:100%; background:var(--bg-card, #1e293b); border:1px solid var(--border-color, #334155); border-radius:14px; padding:30px; text-align:center;">
          <h1 style="margin-bottom:6px; letter-spacing:1px;">AURAWAY 🎓</h1>
          <p style="color:#94a3b8; font-size:0.9rem; margin-bottom:20px;">Enter the Student Access Code issued by your teacher to unlock your dashboard.</p>
          <input type="text" id="globalStudentCodeInput" placeholder="e.g. CLASS8A-4921" style="width:100%; padding:12px; border-radius:8px; border:1px solid #334155; background:#0f172a; color:#fff; font-size:1rem; text-align:center; text-transform:uppercase; margin-bottom:12px;">
          <p id="globalAuthError" style="color:#ef4444; font-size:0.85rem; margin-bottom:12px; display:${customMsg ? 'block' : 'none'};">${customMsg}</p>
          <button id="globalUnlockBtn" onclick="verifyGlobalStudentCode()" style="width:100%; padding:12px; border:none; border-radius:8px; background:#6366f1; color:#fff; font-weight:700; font-size:1rem; cursor:pointer;">Unlock Student Dashboard</button>
        </div>
      </div>
    `;
  });
}

async function verifyGlobalStudentCode() {
  const code = document.getElementById('globalStudentCodeInput').value.trim().toUpperCase();
  const errEl = document.getElementById('globalAuthError');
  const btn = document.getElementById('globalUnlockBtn');

  if (!code) {
    errEl.textContent = '❌ Please enter your teacher-issued code.';
    errEl.style.display = 'block';
    return;
  }

  btn.textContent = 'Verifying with Teacher Server...';
  const { data, error } = await supabaseClient
    .from('students')
    .select('*')
    .eq('student_code', code)
    .maybeSingle();

  if (error || !data) {
    btn.textContent = 'Unlock Student Dashboard';
    errEl.textContent = '❌ Access Declined: Invalid code. Only teacher-generated codes are allowed.';
    errEl.style.display = 'block';
    return;
  }

  localStorage.setItem('auraway_student_code', code);
  localStorage.setItem('auraway_student_profile', JSON.stringify(data));
  window.location.reload();
}

function studentLogout() {
  localStorage.removeItem('auraway_student_code');
  localStorage.removeItem('auraway_student_profile');
  window.location.reload();
}
