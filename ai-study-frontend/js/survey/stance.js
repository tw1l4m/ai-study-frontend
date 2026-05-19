// ── analyzeStance() + selectBotCount() + renderStanceBanner() ──────

// ── Stance detection ──────────────────────────────────
function analyzeStance(pre,mid){
  // PRE: p1,p3,p6=pro-AI; p2,p4,p5=pro-teacher
  // MID: m4=pro-AI; m2,m3,m5,m6=pro-teacher
  const pa=(pre.p1||3)+(pre.p3||3)+(pre.p6||3)+(mid.m4||3);
  const pt=(pre.p2||3)+(pre.p4||3)+(pre.p5||3)+(mid.m2||3)+(mid.m3||3)+(mid.m5||3)+(mid.m6||3);
  if(pa>pt+4) return 'pro_ai';
  if(pt>pa+4) return 'pro_teacher';
  return 'neutral';
}

function renderStanceBanner(){
  const b=document.getElementById('stance-banner');
  if(!b)return;
  const k=S.userStance==='pro_ai'?'stanceProAI':S.userStance==='pro_teacher'?'stanceProTeacher':'stanceNeutral';
  const cls=S.userStance==='pro_ai'?'stance-pro-ai':S.userStance==='pro_teacher'?'stance-pro-teacher':'stance-neutral';
  b.className='stance-banner '+cls;
  b.style.display='flex';
  b.textContent=t(k);
}

// ── Bot count picker ──────────────────
let selectedBotCount=1;
function selectBotCount(n){
  selectedBotCount=n;
  [1,2,3].forEach(i=>{
    const el=document.getElementById('bot-opt-'+i);
    if(el){
      el.classList.toggle('selected',i===n);
      const radio=el.querySelector('input[type=radio]');
      if(radio) radio.checked=(i===n);
    }
  });
  // Show/hide dots based on count
  ['dot-2','dot-3'].forEach((id,idx)=>{
    const el=document.getElementById(id);
    if(el) el.style.display=(n>=idx+2)?'':'none';
  });
}

// ── User context injected into bot system prompts ───────────
