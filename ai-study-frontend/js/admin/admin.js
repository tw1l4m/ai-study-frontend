// ── Admin dashboard logic: login, fetch participants, stats, detail view

const API = (()=>{
  // Auto-detect backend URL
  const stored = localStorage.getItem('admin_api_url');
  return stored || 'https://ai-study-backend-mylb.onrender.com';
})();

let adminToken = '';
let allParticipants = [];
let allUsers = [];
let refreshInterval = null;

// ── AUTH ────────────────────────────────────────────────────
async function doLogin(){
  const pw = document.getElementById('admin-pw').value;
  const err = document.getElementById('login-err');
  err.classList.remove('show');
  try {
    const r = await fetch(`${API}/api/admin/login`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ password: pw })
    });
    const d = await r.json();
    if (d.ok) {
      adminToken = d.token;
      localStorage.setItem('admin_token', adminToken);
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('dashboard').style.display = 'block';
      loadAll();
      refreshInterval = setInterval(loadAll, 30000);
    } else {
      err.classList.add('show');
    }
  } catch(e) {
    err.textContent = 'Connection error: ' + e.message;
    err.classList.add('show');
  }
}

function doLogout(){
  clearInterval(refreshInterval);
  adminToken = '';
  localStorage.removeItem('admin_token');
  location.reload();
}

// Try auto-login with stored token
window.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem('admin_token');
  if (stored) {
    adminToken = stored;
    // Verify token still valid
    fetch(`${API}/api/admin/stats`, { headers: {'x-admin-token': adminToken} })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard').style.display = 'block';
        loadAll();
        refreshInterval = setInterval(loadAll, 30000);
      })
      .catch(() => localStorage.removeItem('admin_token'));
  }
});

async function apiFetch(path) {
  const r = await fetch(`${API}${path}`, { headers: {'x-admin-token': adminToken} });
  if (!r.ok) throw new Error(r.status);
  return r.json();
}

// ── LOAD ALL ─────────────────────────────────────────────────
async function loadAll(){
  try {
    const [stats, pData, uData] = await Promise.all([
      apiFetch('/api/admin/stats'),
      apiFetch('/api/admin/participants'),
      apiFetch('/api/admin/users')
    ]);
    renderStats(stats);
    allParticipants = pData.participants || [];
    allUsers = uData.users || [];
    filterParticipants();
    renderUsers();
    renderStanceAnalysis(stats);
  } catch(e) {
    console.error('Load failed:', e);
  }
}

// ── STATS ────────────────────────────────────────────────────
function renderStats(s){
  document.getElementById('s-total').textContent = s.total || 0;
  document.getElementById('s-completed').textContent = s.completed || 0;
  document.getElementById('s-active').textContent = s.active || 0;
  document.getElementById('s-users').textContent = s.totalUsers || 0;
  const shift = s.shifts?.avgShift;
  document.getElementById('s-shift').textContent = shift != null
    ? (shift > 0 ? '+' : '') + shift.toFixed(2) : '—';
}

// ── TABS ─────────────────────────────────────────────────────
function switchTab(name){
  document.querySelectorAll('.tab').forEach((t,i)=>{
    const names=['participants','accounts','stances'];
    t.classList.toggle('active', names[i]===name);
  });
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
}

// ── PARTICIPANTS TABLE ────────────────────────────────────────
function filterParticipants(){
  const q = (document.getElementById('p-search').value||'').toLowerCase();
  const stance = document.getElementById('p-stance-filter').value;
  const complete = document.getElementById('p-complete-filter').value;

  const filtered = allParticipants.filter(p => {
    if (q && !JSON.stringify(p).toLowerCase().includes(q)) return false;
    if (stance && p.detected_stance !== stance) return false;
    if (complete === 'completed' && !p.completed_at) return false;
    if (complete === 'incomplete' && p.completed_at) return false;
    return true;
  });
  renderParticipants(filtered);
}

function renderParticipants(list){
  const tb = document.getElementById('p-tbody');
  if (!list.length) {
    tb.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:#94a3b8">No participants found</td></tr>';
    return;
  }
  tb.innerHTML = list.map(p => {
    const shift = (p.pre_avg != null && p.post_avg != null)
      ? (p.post_avg - p.pre_avg).toFixed(2) : '—';
    const shiftColor = shift !== '—' ? (parseFloat(shift) > 0.2 ? '#059669' : parseFloat(shift) < -0.2 ? '#dc2626' : '#64748b') : '#94a3b8';
    const stanceBadge = {pro_ai:'badge-blue',pro_teacher:'badge-amber',neutral:'badge-gray'}[p.detected_stance] || 'badge-gray';
    const status = p.completed_at ? '<span class="badge badge-green">Done</span>' : '<span class="badge badge-purple">Active</span>';
    return `<tr>
      <td style="font-family:monospace;font-size:.72rem">${(p.participant_id||'—').slice(0,12)}</td>
      <td>${p.age||'—'}/${(p.gender||'—').slice(0,1).toUpperCase()}</td>
      <td>${p.field||'—'}</td>
      <td><span class="badge ${stanceBadge}">${(p.detected_stance||'—').replace('_',' ')}</span></td>
      <td>${p.pre_avg ? parseFloat(p.pre_avg).toFixed(2) : '—'}</td>
      <td>${p.post_avg ? parseFloat(p.post_avg).toFixed(2) : '—'}</td>
      <td style="color:${shiftColor};font-weight:500">${shift !== '—' && parseFloat(shift) > 0 ? '+' : ''}${shift}</td>
      <td>${status}</td>
      <td><button class="view-btn" onclick="showDetail('${p.participant_id}')">View</button></td>
    </tr>`;
  }).join('');
}

// ── USERS TABLE ───────────────────────────────────────────────
function renderUsers(){
  const tb = document.getElementById('u-tbody');
  if (!allUsers.length) {
    tb.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:#94a3b8">No accounts found</td></tr>';
    return;
  }
  tb.innerHTML = allUsers.map(u => `<tr>
    <td>${u.email||'—'}</td>
    <td>${u.firstName||''} ${u.lastName||''}</td>
    <td>${u.interfaceLang||'en'}</td>
    <td style="font-size:.75rem;color:#64748b">${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
    <td>${u.studyCompleted ? '<span class="badge badge-green">Yes</span>' : '<span class="badge badge-gray">No</span>'}</td>
  </tr>`).join('');
}

// ── STANCE ANALYSIS ───────────────────────────────────────────
function renderStanceAnalysis(stats){
  const container = document.getElementById('stance-analysis');
  const stances = stats.stances || [];
  const total = stances.reduce((a,b) => a + b.count, 0) || 1;

  const stanceColors = {pro_ai:'#2563eb', pro_teacher:'#f59e0b', neutral:'#64748b', null:'#94a3b8'};
  const stanceLabels = {pro_ai:'Pro AI', pro_teacher:'Pro Teacher', neutral:'Neutral'};

  container.innerHTML = `
    <div class="table-wrap" style="padding:20px">
      <h4 style="font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:16px">Stance distribution</h4>
      ${stances.map(s => `
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:5px">
            <span style="font-weight:500">${stanceLabels[s._id] || s._id || 'Unknown'}</span>
            <span style="color:#64748b">${s.count} (${Math.round(s.count/total*100)}%)</span>
          </div>
          <div class="score-bar"><div class="score-fill" style="width:${s.count/total*100}%;background:${stanceColors[s._id]||'#94a3b8'}"></div></div>
        </div>
      `).join('')}
    </div>
    <div class="table-wrap" style="padding:20px">
      <h4 style="font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:16px">Opinion shift summary</h4>
      ${stats.shifts?.count ? `
        <div class="detail-row"><span class="detail-key">Participants with complete data</span><span class="detail-val">${stats.shifts.count}</span></div>
        <div class="detail-row"><span class="detail-key">Average shift (pre → post)</span>
          <span class="detail-val" style="font-weight:600;color:${stats.shifts.avgShift > 0 ? '#059669' : '#dc2626'}">
            ${stats.shifts.avgShift > 0 ? '+' : ''}${stats.shifts.avgShift.toFixed(3)}
          </span>
        </div>
        <p style="font-size:.75rem;color:#94a3b8;margin-top:12px">Positive = opinion shifted toward valuing teachers more. Scale 1–5.</p>
      ` : '<p style="color:#94a3b8;font-size:.82rem">Not enough data yet.</p>'}
    </div>`;
}

// ── DETAIL PANEL ──────────────────────────────────────────────
async function showDetail(pid){
  if (!pid) return;
  document.getElementById('detail-title').textContent = 'Loading…';
  document.getElementById('detail-body').innerHTML = '<p style="padding:20px;color:#64748b">Loading participant data…</p>';
  document.getElementById('detail-overlay').classList.add('open');

  try {
    const { participant: p } = await apiFetch(`/api/admin/participant/${pid}`);
    document.getElementById('detail-title').textContent = `Participant ${p.participant_id}`;
    document.getElementById('detail-body').innerHTML = buildDetailHTML(p);
  } catch(e) {
    document.getElementById('detail-body').innerHTML = `<p style="color:#dc2626;padding:20px">Error: ${e.message}</p>`;
  }
}

function closeDetail(){
  document.getElementById('detail-overlay').classList.remove('open');
}

function buildDetailHTML(p){
  const QS_PRE = [
    {id:'p1',label:'AI can teach as effectively as a professor'},
    {id:'p2',label:'Teachers provide something AI cannot replace'},
    {id:'p3',label:'I trust AI more than my teachers'},
    {id:'p4',label:'Human teacher-student relationship is essential'},
    {id:'p5',label:'AI makes students think less critically'},
    {id:'p6',label:'AI will replace teachers in Algeria'},
  ];
  const QS_MID = [
    {id:'m1',label:'Article changed my thinking'},
    {id:'m2',label:'AI trains obedience not critical thinking'},
    {id:'m3',label:'Classroom friction is important for learning'},
    {id:'m4',label:'Remote students benefit more from AI'},
    {id:'m5',label:'AI misses cultural and local context'},
    {id:'m6',label:'AI dependency harms my ability to debate'},
  ];
  const QS_POST = [
    {id:'q1',label:'My opinion on AI changed since study began'},
    {id:'q2',label:'Forum made me think of new arguments'},
    {id:'q3',label:'Teachers provide something irreplaceable'},
    {id:'q4',label:'AI should be supplement not replacement'},
    {id:'q5',label:'Critical dialogue is essential for opinions'},
    {id:'q6',label:'I would advocate for protecting teacher roles'},
  ];

  function surveyRows(data, qs){
    if (!data) return '<p style="color:#94a3b8;font-size:.8rem">No data</p>';
    return qs.map(q => {
      const v = data[q.id];
      if (v == null) return '';
      const pct = (v-1)/4*100;
      return `<div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:.78rem;margin-bottom:3px">
          <span style="color:#334155">${q.label}</span>
          <span style="font-weight:600;color:#1e40af">${v}/5</span>
        </div>
        <div class="score-bar"><div class="score-fill" style="width:${pct}%"></div></div>
      </div>`;
    }).join('');
  }

  const shift = (p.pre_avg != null && p.post_avg != null)
    ? (p.post_avg - p.pre_avg).toFixed(3) : null;

  return `
    <div class="detail-section">
      <h4>Profile</h4>
      <div class="detail-row"><span class="detail-key">Participant ID</span><span class="detail-val" style="font-family:monospace;font-size:.75rem">${p.participant_id||'—'}</span></div>
      <div class="detail-row"><span class="detail-key">Email</span><span class="detail-val">${p.user_email||'—'}</span></div>
      <div class="detail-row"><span class="detail-key">Age / Gender</span><span class="detail-val">${p.age||'—'} / ${p.gender||'—'}</span></div>
      <div class="detail-row"><span class="detail-key">Level</span><span class="detail-val">${p.level||'—'}</span></div>
      <div class="detail-row"><span class="detail-key">Field</span><span class="detail-val">${p.field||'—'}</span></div>
      <div class="detail-row"><span class="detail-key">Daily AI use</span><span class="detail-val">${p.ai_daily_use||'—'}</span></div>
      <div class="detail-row"><span class="detail-key">Interface language</span><span class="detail-val">${p.interface_lang||'—'}</span></div>
      <div class="detail-row"><span class="detail-key">Started</span><span class="detail-val">${p.created_at ? new Date(p.created_at).toLocaleString() : '—'}</span></div>
      <div class="detail-row"><span class="detail-key">Completed</span><span class="detail-val">${p.completed_at ? new Date(p.completed_at).toLocaleString() : '—'}</span></div>
    </div>

    ${p.psychological_profile ? `
    <div class="detail-section">
      <h4>Psychological portrait</h4>
      <div class="portrait-text">${p.psychological_profile}</div>
    </div>` : ''}

    ${p.contradictions?.length ? `
    <div class="detail-section">
      <h4>Detected contradictions (${p.contradictions.length})</h4>
      ${p.contradictions.map(c => `
        <div class="contradiction">
          <strong>${c.code}:</strong> ${c.description}<br>
          <em style="opacity:.8">Suggested: "${c.suggested_question}"</em>
        </div>`).join('')}
    </div>` : ''}

    ${p.bot_strategy ? `
    <div class="detail-section">
      <h4>Bot strategy applied</h4>
      <div class="portrait-text">${p.bot_strategy}</div>
    </div>` : ''}

    <div class="detail-section">
      <h4>Opinion scores</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">
        ${['pre_avg','mid_avg','post_avg'].map(k => `
          <div style="background:#f8fafc;border-radius:6px;padding:10px;text-align:center">
            <div style="font-size:1.4rem;font-weight:700;color:#1e40af">${p[k] != null ? parseFloat(p[k]).toFixed(2) : '—'}</div>
            <div style="font-size:.68rem;color:#64748b;margin-top:2px">${{pre_avg:'Before reading',mid_avg:'After reading',post_avg:'After chat'}[k]}</div>
          </div>`).join('')}
        ${shift != null ? `
          <div style="background:${parseFloat(shift)>0?'#f0fdf4':'#fef2f2'};border-radius:6px;padding:10px;text-align:center">
            <div style="font-size:1.4rem;font-weight:700;color:${parseFloat(shift)>0?'#059669':'#dc2626'}">${parseFloat(shift)>0?'+':''}${shift}</div>
            <div style="font-size:.68rem;color:#64748b;margin-top:2px">Total shift</div>
          </div>` : ''}
      </div>
    </div>

    <div class="detail-section">
      <h4>Survey 1 — Before reading</h4>
      ${surveyRows(p.pre_survey, QS_PRE)}
    </div>

    <div class="detail-section">
      <h4>Survey 2 — After reading</h4>
      ${surveyRows(p.mid_survey, QS_MID)}
    </div>

    ${p.post_survey ? `
    <div class="detail-section">
      <h4>Survey 3 — After discussion</h4>
      ${surveyRows(p.post_survey, QS_POST)}
    </div>` : ''}

    ${p.open_reflection ? `
    <div class="detail-section">
      <h4>Open reflection</h4>
      <div class="portrait-text">${p.open_reflection}</div>
    </div>` : ''}

    ${p.chat_log?.length ? `
    <div class="detail-section">
      <h4>Chat log (${p.chat_log.length} messages, ${p.chat_turns||0} user turns)</h4>
      <div style="max-height:400px;overflow-y:auto;padding:4px">
        ${p.chat_log.map(m => `
          <div class="chat-msg ${m.role}">
            <div class="sender">${m.role==='user' ? 'Participant' : (m.sender||'Bot')}</div>
            ${m.content}
          </div>`).join('')}
      </div>
    </div>` : ''}
  `;
}
