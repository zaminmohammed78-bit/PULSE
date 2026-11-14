// Student code login with a device-local family account list.
// Each sibling keeps their own teacher-issued code and dashboard profile.
const FAMILY_KEY = 'auraway_family_students';

function readFamilyStudents() {
  try {
    const value = JSON.parse(localStorage.getItem(FAMILY_KEY) || '[]');
    return Array.isArray(value) ? value.filter(item => item && item.code && item.profile) : [];
  } catch (_) {
    return [];
  }
}

function saveFamilyStudents(items) {
  localStorage.setItem(FAMILY_KEY, JSON.stringify(items));
}

function setActiveStudent(student) {
  localStorage.setItem('auraway_student_code', student.code);
  localStorage.setItem('auraway_student_profile', JSON.stringify(student.profile));
  window.location.reload();
}

(async function enforceStudentLogin() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage === 'teacher.html' || currentPage === 'parent.html' || currentPage === 'portals.html') return;

  const savedCode = localStorage.getItem('auraway_student_code');
  if (!savedCode) {
    showStudentLoginGate();
    return;
  }

  if (!supabaseClient) {
    showStudentLoginGate('The student login service is unavailable. Please try again later.');
    return;
  }

  const { data, error } = await supabaseClient
    .rpc('get_student_profile_by_code', { p_student_code: savedCode })
    .maybeSingle();

  if (error) {
    showStudentLoginGate('Could not verify this code. Check your internet connection and try again.');
    return;
  }

  if (!data) {
    localStorage.removeItem('auraway_student_code');
    localStorage.removeItem('auraway_student_profile');
    saveFamilyStudents(readFamilyStudents().filter(item => item.code !== savedCode));
    showStudentLoginGate('This student code is no longer active. Please contact your teacher.');
    return;
  }

  localStorage.setItem('auraway_student_profile', JSON.stringify(data));
  const family = readFamilyStudents().filter(item => item.code !== savedCode);
  family.unshift({ code: savedCode, profile: data });
  saveFamilyStudents(family);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addStudentAccountControls, { once: true });
  else addStudentAccountControls();
})();

function showStudentLoginGate(customMsg = '') {
  const render = () => {
    const family = readFamilyStudents();
    document.body.innerHTML = `
      <main style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg-primary,#0b0f19);color:var(--text-primary,#f9fafb);padding:20px;font-family:system-ui,sans-serif;">
        <section style="max-width:440px;width:100%;background:var(--bg-card,#1f2937);border:1px solid var(--border-color,#374151);border-radius:16px;padding:28px;">
          <h1 style="margin-bottom:8px;text-align:center;">AURAWAY 🎓</h1>
          <p style="color:var(--text-secondary,#9ca3af);text-align:center;margin-bottom:20px;">Sign in with the student code given by your teacher. Add each sibling with their own code.</p>
          <div id="familyStudentChoices" style="display:grid;gap:8px;margin-bottom:16px;"></div>
          <form id="studentCodeLoginForm" style="display:grid;gap:10px;">
            <label for="globalStudentCodeInput">Student access code</label>
            <input type="text" id="globalStudentCodeInput" autocomplete="off" placeholder="Enter student code" required style="width:100%;padding:12px;border-radius:8px;border:1px solid #475569;background:#0f172a;color:#fff;font-size:1rem;text-align:center;text-transform:uppercase;">
            <p id="globalAuthError" role="alert" style="color:#f87171;font-size:.9rem;display:${customMsg ? 'block' : 'none'};">${customMsg}</p>
            <button id="globalUnlockBtn" type="submit" style="width:100%;padding:12px;border:0;border-radius:8px;background:#6366f1;color:white;font-weight:700;font-size:1rem;cursor:pointer;">Sign in / Add student</button>
          </form>
          <p style="font-size:.78rem;color:var(--text-secondary,#9ca3af);text-align:center;margin-top:14px;">Your saved sibling accounts stay on this device until you remove them.</p>
        </section>
      </main>`;

    const choices = document.getElementById('familyStudentChoices');
    family.forEach(student => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Continue as ' + (student.profile.student_name || 'Student');
      button.style.cssText = 'padding:10px;border:1px solid #475569;border-radius:8px;background:transparent;color:inherit;cursor:pointer;';
      button.addEventListener('click', () => setActiveStudent(student));
      choices.appendChild(button);
    });

    document.getElementById('studentCodeLoginForm').addEventListener('submit', verifyGlobalStudentCode);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, { once: true });
  else render();
}

async function verifyGlobalStudentCode(event) {
  if (event) event.preventDefault();
  const input = document.getElementById('globalStudentCodeInput');
  const errEl = document.getElementById('globalAuthError');
  const btn = document.getElementById('globalUnlockBtn');
  const code = input.value.trim().toUpperCase();

  if (!code) {
    errEl.textContent = 'Please enter your teacher-issued student code.';
    errEl.style.display = 'block';
    return;
  }
  if (!supabaseClient) {
    errEl.textContent = 'Login service is not configured. Please contact the school administrator.';
    errEl.style.display = 'block';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Checking code…';
  const { data, error } = await supabaseClient
    .rpc('get_student_profile_by_code', { p_student_code: code })
    .maybeSingle();

  if (error || !data) {
    btn.disabled = false;
    btn.textContent = 'Sign in / Add student';
    errEl.textContent = error ? 'Could not verify the code. Please try again.' : 'Invalid student code. Check it with your teacher.';
    errEl.style.display = 'block';
    return;
  }

  const family = readFamilyStudents().filter(item => item.code !== code);
  family.unshift({ code, profile: data });
  saveFamilyStudents(family);
  localStorage.setItem('auraway_student_code', code);
  localStorage.setItem('auraway_student_profile', JSON.stringify(data));
  window.location.reload();
}

function addStudentAccountControls() {
  const header = document.querySelector('.header-bar');
  if (!header || document.getElementById('studentAccountControls')) return;

  const controls = document.createElement('div');
  controls.id = 'studentAccountControls';
  controls.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;align-items:center;';
  controls.innerHTML = `
    <button type="button" class="btn" id="switchStudentAccount">Switch / Add sibling</button>
    <button type="button" class="btn" id="studentSignOut" style="background:#64748b;">Sign out</button>`;
  header.appendChild(controls);
  document.getElementById('switchStudentAccount').addEventListener('click', () => showStudentLoginGate());
  document.getElementById('studentSignOut').addEventListener('click', studentLogout);
}

function studentLogout() {
  localStorage.removeItem('auraway_student_code');
  localStorage.removeItem('auraway_student_profile');
  showStudentLoginGate('You have signed out. Choose another student or enter a code.');
}
