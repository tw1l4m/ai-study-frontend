// ── Backend API URL, helpers, and password hashing ─────────────────

// ── BACKEND URL — remplacez par votre URL Render après déploiement ──
const API_BASE_URL = 'https://ai-study-backend-mylb.onrender.com/api';
// Exemple: 'https://ai-study-backend.onrender.com/api'

// Anciennes constantes désactivées (tout passe par le backend)
const MONGO_API_URL = null;
const MONGO_API_KEY = null;
const ANTHROPIC_KEY = null;

// ── Backend API helpers (proxy vers le serveur Render) ────────────
async function apiPost(path, body) {
  const r = await fetch(API_BASE_URL + path, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
  if(!r.ok) throw new Error('API '+r.status);
  return r.json();
}
const mFindUser  = e=>apiPost('/users/find',{email:e}).then(r=>r.document||null);
const mInsertUser= d=>apiPost('/users/insert',{document:d});
const mUpdateUser= (e,u)=>apiPost('/users/update',{filter:{email:e},update:{$set:u}});
const mInsertP   = d=>apiPost('/participants/insert',{document:d});
const mUpdateP   = (pid,u)=>apiPost('/participants/update',{filter:{participant_id:pid},update:{$set:u}});
const hashPw     = async pw=>{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(pw));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')};
