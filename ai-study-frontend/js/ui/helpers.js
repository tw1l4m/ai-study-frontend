// ── UI: goTo(), toast(), renderSurvey(), collectSurvey(), avg() ─────

// ════════════════════════════════════════
function goTo(n){
  document.querySelectorAll('.stage').forEach(s=>s.classList.add('hidden'));
  document.getElementById('stage-'+n).classList.remove('hidden');
  window.scrollTo({top:0,behavior:'smooth'});
  const p=[0,14,28,42,60,80,100];
  document.getElementById('progress-fill').style.width=(p[n]||0)+'%';
}
function toast(key){
  const el=document.getElementById('toast');
  el.textContent=T[LANG][key]||key;
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),3000);
}
function renderSurvey(cid,prefix){
  const lb=T[LANG].scaleLabels;
  const qs=prefix==='pre'?QS_PRE:prefix==='mid'?QS_MID:QS_POST;
  document.getElementById(cid).innerHTML=qs.map(q=>`
    <div class="likert-group">
      <div class="likert-q">${q[LANG]}</div>
      <div class="likert-scale">
        ${[1,2,3,4,5].map((v,i)=>`<label><input type="radio" name="${prefix}_${q.id}" value="${v}">${lb[i]}</label>`).join('')}
      </div>
    </div>`).join('');
}
function collectSurvey(prefix){
  const qs=prefix==='pre'?QS_PRE:prefix==='mid'?QS_MID:QS_POST;
  const d={};let ok=true;
  qs.forEach(q=>{const v=document.querySelector(`input[name="${prefix}_${q.id}"]:checked`);if(!v)ok=false;else d[q.id]=+v.value});
  return ok?d:null;
}
function avg(d){const v=Object.values(d);return(v.reduce((a,b)=>a+b,0)/v.length).toFixed(2)}

// ════════════════════════════════════════
//  STUDY FLOW
// ════════════════════════════════════════
