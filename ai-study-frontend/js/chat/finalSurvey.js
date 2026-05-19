// ── Post-chat: updateTurnInfo, goToFinalSurvey, submitFinalSurvey ───

function updateTurnInfo(){
  const rem=Math.max(0,6-S.turns);
  const el=document.getElementById('turn-info');if(!el)return;
  if(rem>0){el.textContent=t('turnRemaining',rem);el.style.color='var(--gray-400)';el.style.fontWeight=''}
  else{el.textContent=t('turnDone');el.style.color='var(--green)';el.style.fontWeight='600'}
}

async function goToFinalSurvey(){
  await mUpdateP(S.pid,{chat_log:S.chat,chat_turns:S.turns,user_stance:S.userStance,bot_count:S.botCount});
  renderSurvey('post-survey-questions','post');
  goTo(5);
}

async function submitFinalSurvey(){
  const d=collectSurvey('post');if(!d){toast('answerAll');return}
  S.post=d;
  const ref=document.getElementById('open-reflection').value.trim();
  await mUpdateP(S.pid,{post_survey:d,post_avg:+avg(d),open_reflection:ref,completed_at:new Date().toISOString()});
  if(currentUser){
    await mUpdateUser(currentUser.email,{studyCompleted:true,participantId:S.pid,completedAt:new Date().toISOString()});
    currentUser.studyCompleted=true;
  }
  document.getElementById('res-pre').textContent=avg(S.pre);
  document.getElementById('res-mid').textContent=avg(S.mid);
  document.getElementById('res-post').textContent=avg(S.post);
  document.getElementById('pid-display').textContent=S.pid;
  goTo(6);
}

// ── INIT ──────────────────────────────
document.getElementById('stage-auth').classList.remove('hidden');
