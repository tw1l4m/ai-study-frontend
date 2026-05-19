// ── Study flow: submitRegistration, submitPreSurvey, submitArticleRead, submitMidSurvey

// ════════════════════════════════════════
async function submitRegistration(){
  if(!document.getElementById('consent-cb').checked){toast('acceptConsent');return}
  const age=document.getElementById('reg-age').value,gender=document.getElementById('reg-gender').value,
        level=document.getElementById('reg-level').value,field=document.getElementById('reg-field').value.trim(),
        aiUse=document.getElementById('reg-ai-use').value;
  if(!age||!gender||!level||!field||!aiUse){toast('fillAll');return}
  S.pid='P'+Date.now();
  S.reg={age:+age,gender,level,field,ai_daily_use:aiUse,interface_lang:LANG};
  await mInsertP({participant_id:S.pid,user_email:currentUser?.email||null,...S.reg,created_at:new Date().toISOString()});
  renderSurvey('pre-survey-questions','pre');
  goTo(1);
}

async function submitPreSurvey(){
  const d=collectSurvey('pre');if(!d){toast('answerAll');return}
  S.pre=d;
  await mUpdateP(S.pid,{pre_survey:d,pre_avg:+avg(d)});
  goTo(2);
}

function submitArticleRead(){
  if(!document.getElementById('read-cb').checked){toast('confirmRead');return}
  renderSurvey('mid-survey-questions','mid');
  goTo(3);
}

async function submitMidSurvey(){
  const d=collectSurvey('mid');if(!d){toast('answerAll');return}
  S.mid=d;
  await mUpdateP(S.pid,{mid_survey:d,mid_avg:+avg(d)});
  S.userStance=analyzeStance(S.pre,S.mid);
  S.botCount=selectedBotCount;

  // Build and save psychological profile to MongoDB
  const profile=buildProfileData();
  S.profile=profile;
  await mUpdateP(S.pid,{
    psychological_profile: profile.portrait,
    detected_stance:       profile.stance,
    profile_scores:        profile.scores,
    contradictions:        profile.contradictions,
    contradictions_count:  profile.contradictions_count,
    bot_strategy:          profile.strategy,
    profile_generated_at:  profile.generated_at
  });

  BOT_SYSTEMS=buildBotSystems();
  ACTIVE_BOTS=BOTS.slice(0,S.botCount);
  renderStanceBanner();
  selectBotCount(S.botCount);
  initChat();
  goTo(4);
}

// ════════════════════════════════════════
//  CHAT ENGINE
// ════════════════════════════════════════
