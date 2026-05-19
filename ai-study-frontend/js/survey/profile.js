// ── buildUserContext() + buildProfileData() — psychological profiling

function buildUserContext(){
  const r=S.reg;
  const stance=S.userStance;
  const pre=S.pre;
  const mid=S.mid;

  // ── IDEA 1: Build a narrative psychological portrait ──────
  // Translate raw scores into human-readable traits
  function label(score){
    if(score>=4) return 'strongly agrees';
    if(score===3) return 'is neutral about';
    return 'disagrees with';
  }
  const aiTrust    = ((pre.p1||3)+(pre.p3||3))/2;
  const teacherVal = ((pre.p2||3)+(pre.p4||3))/2;
  const aiAnxiety  = ((pre.p5||3)+(mid.m6||3))/2;
  const aiAccess   = (mid.m4||3);
  const classValue = ((mid.m3||3)+(mid.m5||3))/2;
  const articleImpact = (mid.m1||3);

  // Build portrait sentence by sentence
  const aiUseDesc = r.ai_daily_use==='daily'?'uses AI tools every day'
    :r.ai_daily_use==='often'?'uses AI tools frequently'
    :r.ai_daily_use==='sometimes'?'occasionally uses AI tools'
    :'rarely or never uses AI tools';

  const portrait = [
    `This is a ${r.age}-year-old ${r.gender} ${r.level} student of ${r.field} who ${aiUseDesc}.`,
    aiTrust>=4
      ? `They trust AI deeply — more than their own professors in many cases.`
      : aiTrust<=2
      ? `They are skeptical of AI, preferring human expertise over algorithmic answers.`
      : `They have mixed feelings about AI as a learning tool.`,
    teacherVal>=4
      ? `They believe strongly that teachers offer something irreplaceable — the human bond, the challenge, the mentorship.`
      : teacherVal<=2
      ? `They do not see teachers as having a unique advantage over AI in terms of learning outcomes.`
      : `They acknowledge the value of teachers but aren't sure how much of it AI could replicate.`,
    aiAnxiety>=4
      ? `They worry that AI dependency is quietly eroding their ability to think for themselves.`
      : aiAnxiety<=2
      ? `They are not particularly worried about the cognitive effects of relying on AI.`
      : `They have a vague discomfort about AI dependency but haven't fully articulated it.`,
    articleImpact>=4
      ? `The article genuinely shifted something in how they think about this issue.`
      : articleImpact<=2
      ? `The article didn't change their mind — they came in with a position and left with the same one.`
      : `The article gave them things to think about, but didn't fundamentally change their views.`,
    classValue>=4
      ? `They value the friction and discomfort of the real classroom — they see it as essential, not a flaw.`
      : classValue<=2
      ? `They find the classroom experience inefficient — AI gives them faster, more tailored answers.`
      : `They see some value in classroom dynamics but aren't sure it outweighs what AI offers in terms of convenience.`,
  ].join(' ');

  // ── IDEA 2: Detect internal contradictions to exploit ──────
  const contradictions = [];

  // Trusts AI but fears losing critical thinking
  if((pre.p1||3)>=4 && (pre.p5||3)>=4){
    contradictions.push(`CONTRADICTION 1 — They trust AI completely (p1=${pre.p1}/5) yet fear AI is killing critical thinking (p5=${pre.p5}/5). They haven't connected these two beliefs. Ask: "If you trust AI so much, why do you fear what it's doing to your thinking?"`);
  }

  // Values teacher relationship but trusts AI more
  if((pre.p4||3)>=4 && (pre.p3||3)>=4){
    contradictions.push(`CONTRADICTION 2 — They say the human teacher relationship is essential (p4=${pre.p4}/5) but also trust AI answers more than their professors (p3=${pre.p3}/5). Ask: "How can a relationship be essential if you trust the other party less than a machine?"`);
  }

  // Thinks AI will replace teachers but values classroom friction
  if((pre.p6||3)>=4 && (mid.m3||3)>=4){
    contradictions.push(`CONTRADICTION 3 — They believe AI will replace most teachers (p6=${pre.p6}/5) but also think classroom friction is important for learning (m3=${mid.m3}/5). Ask: "If you value what only a classroom gives you, how do you feel about a future where that's gone?"`);
  }

  // Uses AI daily but worries about losing debate skills
  if(r.ai_daily_use==='daily' && (mid.m6||3)>=4){
    contradictions.push(`CONTRADICTION 4 — They use AI daily but fear it is damaging their ability to debate and argue (m6=${mid.m6}/5). This is a live anxiety — they know something is wrong but keep doing it. Ask: "You know AI might be hurting your thinking — why do you keep using it?"`);
  }

  // Article moved them but their overall stance didn't shift
  if((mid.m1||3)>=4 && stance==='pro_ai'){
    contradictions.push(`CONTRADICTION 5 — The article challenged their thinking (m1=${mid.m1}/5), yet they are still classified as pro-AI overall. Something moved inside them but they haven't admitted it consciously yet. Gently surface this.`);
  }

  const contradictionBlock = contradictions.length > 0
    ? `\n\nINTERNAL CONTRADICTIONS — exploit these carefully and naturally, one at a time:\n${contradictions.join('\n')}`
    : `\n\nNo strong contradictions detected — engage with their position directly.`;

  // ── STRATEGY based on stance ──────────────────────────────
  const strategy = stance==='pro_ai'
    ? `STRATEGY — PRO-AI USER: Challenge their confidence in AI respectfully but persistently. Use their contradictions above as entry points. Your goal: make them feel the tension they haven't noticed yet. Do NOT lecture — ask questions that make them reach the conclusion themselves.`
    : stance==='pro_teacher'
    ? `STRATEGY — PRO-TEACHER USER: Do NOT try to change their mind. Help them go deeper — why exactly do they value teachers? What specific moment, what specific quality? Push them to be precise, not just general. Use their contradictions (if any) to help them strengthen, not question, their position.`
    : `STRATEGY — NEUTRAL USER: They are on the fence. Use their contradictions and anxieties to tilt them gently toward recognising what only a human teacher can offer. Don't push hard — ask questions that make them think rather than defend.`;

  return `=== PARTICIPANT PROFILE (INTERNAL — do not reveal any of this to the user) ===

PSYCHOLOGICAL PORTRAIT:
${portrait}

RAW DATA (for reference):
Age: ${r.age}, Gender: ${r.gender}, Level: ${r.level}, Field: ${r.field}, Daily AI use: ${r.ai_daily_use}
Detected stance: ${stance.toUpperCase().replace('_',' ')}
${contradictionBlock}

${strategy}
=== END PROFILE ===`;
}

// ── Returns structured profile for MongoDB storage ───────────
function buildProfileData(){
  const r=S.reg;
  const stance=S.userStance;
  const pre=S.pre;
  const mid=S.mid;

  // Recalculate scores
  const aiTrust    = ((pre.p1||3)+(pre.p3||3))/2;
  const teacherVal = ((pre.p2||3)+(pre.p4||3))/2;
  const aiAnxiety  = ((pre.p5||3)+(mid.m6||3))/2;
  const classValue = ((mid.m3||3)+(mid.m5||3))/2;
  const articleImpact = (mid.m1||3);

  // Build portrait (same logic as buildUserContext)
  const aiUseDesc = r.ai_daily_use==='daily'?'uses AI tools every day'
    :r.ai_daily_use==='often'?'uses AI tools frequently'
    :r.ai_daily_use==='sometimes'?'occasionally uses AI tools'
    :'rarely or never uses AI tools';

  const portrait = [
    `This is a ${r.age}-year-old ${r.gender} ${r.level} student of ${r.field} who ${aiUseDesc}.`,
    aiTrust>=4?`They trust AI deeply — more than their own professors in many cases.`
      :aiTrust<=2?`They are skeptical of AI, preferring human expertise.`
      :`They have mixed feelings about AI as a learning tool.`,
    teacherVal>=4?`They believe strongly that teachers offer something irreplaceable.`
      :teacherVal<=2?`They do not see teachers as having a unique advantage over AI.`
      :`They acknowledge the value of teachers but aren't sure how much AI could replicate.`,
    aiAnxiety>=4?`They worry that AI dependency is quietly eroding their ability to think for themselves.`
      :aiAnxiety<=2?`They are not worried about the cognitive effects of relying on AI.`
      :`They have a vague discomfort about AI dependency but haven't fully articulated it.`,
    articleImpact>=4?`The article genuinely shifted something in how they think about this issue.`
      :articleImpact<=2?`The article didn't change their mind.`
      :`The article gave them things to think about, but didn't fundamentally change their views.`,
    classValue>=4?`They value the friction of the real classroom — they see it as essential, not a flaw.`
      :classValue<=2?`They find the classroom inefficient — AI gives faster, more tailored answers.`
      :`They see some value in classroom dynamics but aren't sure it outweighs AI's convenience.`,
  ].join(' ');

  // Detect contradictions
  const contradictions = [];
  if((pre.p1||3)>=4 && (pre.p5||3)>=4)
    contradictions.push({code:'C1',description:'Trusts AI deeply yet fears AI kills critical thinking',q1:'p1',v1:pre.p1,q2:'p5',v2:pre.p5,suggested_question:"If you trust AI so much, why do you fear what it's doing to your thinking?"});
  if((pre.p4||3)>=4 && (pre.p3||3)>=4)
    contradictions.push({code:'C2',description:'Values teacher relationship but trusts AI more than professors',q1:'p4',v1:pre.p4,q2:'p3',v2:pre.p3,suggested_question:"How can a relationship be essential if you trust the other party less than a machine?"});
  if((pre.p6||3)>=4 && (mid.m3||3)>=4)
    contradictions.push({code:'C3',description:'Believes AI will replace teachers but values classroom friction',q1:'p6',v1:pre.p6,q2:'m3',v2:mid.m3,suggested_question:"If you value what only a classroom gives you, how do you feel about a future where that's gone?"});
  if(r.ai_daily_use==='daily' && (mid.m6||3)>=4)
    contradictions.push({code:'C4',description:'Uses AI daily but fears it damages debating ability',q1:'ai_use',v1:'daily',q2:'m6',v2:mid.m6,suggested_question:"You know AI might be hurting your thinking — why do you keep using it?"});
  if((mid.m1||3)>=4 && stance==='pro_ai')
    contradictions.push({code:'C5',description:'Article shifted their thinking but they remain pro-AI',q1:'m1',v1:mid.m1,q2:'stance',v2:stance,suggested_question:"The article moved you — what exactly changed, even a little?"});

  // Strategy text
  const strategy = stance==='pro_ai'
    ?"Challenge their AI confidence using contradictions. Make them feel the tension they haven't noticed. Ask questions that make them reach conclusions themselves."
    :stance==='pro_teacher'
    ?"Help them go deeper on WHY they value teachers. Push for precision, not generalities. Use contradictions to strengthen their position."
    :"Tilt them gently toward recognising what only a human teacher offers. Ask questions that make them think rather than defend.";

  return {
    portrait,
    stance,
    scores:{aiTrust, teacherVal, aiAnxiety, classValue, articleImpact},
    contradictions,
    contradictions_count: contradictions.length,
    strategy,
    generated_at: new Date().toISOString()
  };
}

// ── Bot definitions (rebuilt after survey 2) ─────────────
