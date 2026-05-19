// ── Chat engine: initChat, buildTagBar, buildOpenings, appendBotMsg, appendUserMsg, showTyping, buildMsgs, callClaude, initSendButton, sendMessage

function initChat(){
  document.getElementById('chat-window').innerHTML='';
  S.chat=[];S.turns=0;chatLocked=false;
  const input=document.getElementById('chat-input');
  const btn=document.getElementById('send-btn');
  input.disabled=true;btn.disabled=true;
  ACTIVE_BOTS.forEach(b=>document.getElementById(b.dot).classList.add('active'));
  updateTurnInfo();
  buildTagBar(); // render @mention chips
  initSendButton(); // wire send button — must be done after chat init

  // Opening: bots naturally start the thread before user joins
  const openings=buildOpenings();
  let delay=700;
  openings.forEach(({bot,text})=>{
    const d=delay;
    setTimeout(()=>appendBotMsg(bot,text),d);
    delay+=2400+Math.random()*600;
  });
  // Enable user input after openings finish
  setTimeout(()=>{
    input.disabled=false;btn.disabled=false;input.focus();
    updateTurnInfo();
  },delay+200);
}

// Build @mention tag chips based on ACTIVE_BOTS
function buildTagBar(){
  const bar=document.getElementById('tag-bar');
  if(!bar)return;
  bar.innerHTML='';
  const cls=['tag-chip-1','tag-chip-2','tag-chip-3'];
  ACTIVE_BOTS.forEach((bot,i)=>{
    const chip=document.createElement('span');
    chip.className='tag-chip '+cls[i%3];
    chip.innerHTML=`<span class="chip-dot"></span>@${bot.name}`;
    chip.title=LANG==='ar'?'انقر للإشارة إلى هذا المشارك':'Click to mention this participant';
    chip.onclick=()=>{
      const inp=document.getElementById('chat-input');
      // Insert @Name at cursor or end
      const pos=inp.selectionStart||inp.value.length;
      const before=inp.value.substring(0,pos);
      const after=inp.value.substring(pos);
      const tag='@'+bot.name+' ';
      inp.value=before+tag+after;
      inp.focus();
      inp.setSelectionRange(pos+tag.length,pos+tag.length);
    };
    bar.appendChild(chip);
  });
}

function buildOpenings(){
  const stance=S.userStance;
  const n=ACTIVE_BOTS.length;
  const ar=LANG==='ar';

  const msgs_proAI=[
    {bot:BOTS[0],text:ar
      ?"قرأت المقال للتو — نقاط مثيرة للاهتمام. لكن بصراحة، أنا ما زلت أعتقد أن الذكاء الاصطناعي يسد فجوة حقيقية. أستاذي السنة الماضية كان بالكاد متاحًا خارج أوقات المحاضرات، أما ChatGPT فمتاح في الساعة الثانية صباحًا."
      :"Just read that article — some interesting points. Honestly, I still think AI is filling a real gap. My professor last year was barely available outside lecture hours. ChatGPT? Available at 2am."},
    {bot:BOTS[1],text:ar
      ?"ياسين يطرح نقطة وجيهة بشأن إمكانية الوصول. لكنني أختلف قليلًا — التوفر وجودة التعلم شيئان مختلفان تمامًا. تشير أبحاث التطور المعرفي إلى أن الصراع والتحدي الموجَّه من معلم بشري هو ما يُنتج التعلم العميق."
      :"Yacine makes a fair point about access. But availability and quality of learning are different things. Research on cognitive development suggests struggle guided by a human mentor is where deep learning happens."},
    {bot:BOTS[2],text:ar
      ?"قبل أن نكمل — هل يمكنني أن أطرح سؤالًا يؤرقني؟ إذا كان الذكاء الاصطناعي يجيبك بالضبط على ما تريد، وأستاذ جيد يُربكك عن قصد، أيهما يفيد عقلك أكثر؟"
      :"Before we go further — if AI answers exactly what you want, and a good teacher confuses you on purpose, which one is actually doing more for your mind?"}
  ];
  const msgs_proTeacher=[
    {bot:BOTS[0],text:ar
      ?"كنت أفكر في هذا كثيرًا مؤخرًا. كانت لديّ أستاذة هذا الفصل غيّرت تمامًا طريقة تفكيري في البحث — ليس بسبب ما قالته، بل بسبب كيفية تحديها لكل ما قلته. لم يفعل أي روبوت محادثة ذلك معي قط."
      :"I've been thinking about this lately. A professor this semester changed how I see research entirely — not by telling me things, but by challenging everything I said. No chatbot has ever done that."},
    {bot:BOTS[1],text:ar
      ?"هذا يتوافق مع ما تجده أبحاث التعليم باستمرار. النموذج السقراطي — التحدي والنقض والمراجعة — هو ما ينتج فهمًا راسخًا. الذكاء الاصطناعي يُحسّن الرضا، لا النمو."
      :"That matches what educational research keeps finding. The Socratic model — challenge, refutation, revision — produces durable understanding. AI optimises for satisfaction, not growth."},
    {bot:BOTS[2],text:ar
      ?"ما يشغل تفكيري هو: هل المشكلة في الذكاء الاصطناعي تحديدًا، أم في أي أداة تُزيل انزعاج عدم المعرفة؟ ما الذي في علاقة المعلم بالطالب يخلق هذا الانزعاج المثمر فعلًا؟"
      :"Is the problem AI specifically, or any tool that removes the discomfort of not-knowing? What is it about the teacher-student relationship that actually creates that productive friction?"}
  ];
  const msgs_neutral=[
    {bot:BOTS[0],text:ar
      ?"المقال جعلني أريد أن أسألكم مباشرة — هل تعتقدون فعلًا أن هناك منافسة حقيقية هنا؟ هل يمكن للذكاء الاصطناعي والأساتذة أن يتعايشا، أم أن أحدهما سيفوز؟"
      :"That article made me want to ask — do you actually think there's a real competition here? Can AI and teachers coexist, or is one going to win?"},
    {bot:BOTS[1],text:ar
      ?"أعتقد أن تأطيرها كمنافسة يفوّت الهدف. السؤال هو ما هو التعلم فعلًا. إذا كان نقل معلومات، فالذكاء الاصطناعي يفوز بسهولة. إذا كان تحويل طريقة تفكير الشخص، فهذه قضية أصعب بكثير."
      :"Framing it as competition misses the point. If learning is information transfer, AI wins easily. If it's transforming how a person thinks, that's a much harder case to make."},
    {bot:BOTS[2],text:ar
      ?"ما أجده مثيرًا للاهتمام أن أحدًا لا يسأل الطلاب عما يخسرونه فعلًا — لا ما يكسبونه — حين يتحولون إلى الذكاء الاصطناعي. ما الذي توقفت عن فعله كنت تفعله في الفصل؟"
      :"Nobody seems to ask students what they're actually losing — not gaining — when they switch to AI. What do you think you've stopped doing that you used to do in class?"}
  ];

  const all=stance==='pro_ai'?msgs_proAI:stance==='pro_teacher'?msgs_proTeacher:msgs_neutral;
  return all.slice(0,n);
}

function appendBotMsg(bot,text){
  const win=document.getElementById('chat-window');
  const el=document.createElement('div');
  el.className=`msg bot ${bot.cls}`;
  el.innerHTML=`<div class="msg-sender">${bot.name}</div><div class="msg-bubble">${text}</div>`;
  win.appendChild(el);win.scrollTop=win.scrollHeight;
  S.chat.push({role:'assistant',sender:bot.name,content:text,bot:bot.id,ts:Date.now()});
}
function appendUserMsg(text){
  const win=document.getElementById('chat-window');
  const el=document.createElement('div');
  el.className='msg user';
  el.innerHTML=`<div class="msg-sender">${t('youLabel')}</div><div class="msg-bubble">${text}</div>`;
  win.appendChild(el);win.scrollTop=win.scrollHeight;
}
function showTyping(bot,id){
  removeTyping(id);
  const win=document.getElementById('chat-window');
  const el=document.createElement('div');
  el.id=id;el.className=`msg bot ${bot.cls}`;
  el.innerHTML=`<div class="msg-sender">${bot.name}</div><div class="typing-indicator"><span></span><span></span><span></span></div>`;
  win.appendChild(el);win.scrollTop=win.scrollHeight;
}
function removeTyping(id){const el=document.getElementById(id);if(el)el.remove()}

function buildMsgs(text){
  // Hard cap: last 6 messages only — prevents context overflow and token corruption
  // More history = bigger prompt = corrupted Arabic/garbled responses
  const raw=S.chat.slice(-6).map(m=>
    m.role==='user'
      ?{role:'user',    content:m.content}
      :{role:'assistant',content:m.content}
  );
  raw.push({role:'user',content:text});

  // Merge consecutive same-role entries (required by some models)
  const merged=[];
  for(const m of raw){
    if(merged.length>0 && merged[merged.length-1].role===m.role){
      merged[merged.length-1].content += ' '+m.content;
    } else {
      merged.push({...m});
    }
  }
  // Must start with 'user'
  while(merged.length && merged[0].role!=='user') merged.shift();
  return merged;
}

async function callClaude(sys,msgs){
  // Retry up to 3 times with exponential backoff
  let lastErr;
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const d=await apiPost('/chat',{system:sys,messages:msgs});
      const txt=(d.text||'').trim();
      if(txt) return txt;
      throw new Error('Empty response from AI');
    }catch(e){
      lastErr=e;
      console.warn(`callClaude attempt ${attempt} failed:`,e.message);
      if(attempt<3) await new Promise(r=>setTimeout(r,attempt*1200));
    }
  }
  throw lastErr;
}

// ── sendMessage — single entry point, never double-fires ────────
function initSendButton(){
  const btn=document.getElementById('send-btn');
  // Wire button once — no onclick in HTML to prevent double-fire
  btn.addEventListener('click', sendMessage);
}

async function sendMessage(){
  if(chatLocked) return;
  const input=document.getElementById('chat-input');
  const text=input.value.trim();if(!text)return;
  const btn=document.getElementById('send-btn');

  // Lock immediately — single atomic operation
  chatLocked=true;
  input.value='';
  btn.disabled=true;
  input.disabled=true;

  appendUserMsg(text);
  S.chat.push({role:'user',content:text,ts:Date.now()});
  S.turns++;
  updateTurnInfo();

  // Detect @mention — if user tags a specific bot, that bot responds
  const mentionMatch=text.match(/@(Yacine_Dz|Dr_Hadjeres|Rania_M)/i);
  let primary,secondary;
  if(mentionMatch){
    const mentionedName=mentionMatch[1];
    const mentionedBot=ACTIVE_BOTS.find(b=>b.name.toLowerCase()===mentionedName.toLowerCase());
    if(mentionedBot){
      primary=mentionedBot;
      secondary=null; // tagged = only that bot responds
    } else {
      ({primary,secondary}=pickResponder(S.turns));
    }
  } else {
    ({primary,secondary}=pickResponder(S.turns));
  }
  const msgs=buildMsgs(text);
  const primaryTid='typing-'+primary.id;

  try{
    // PRIMARY BOT responds
    showTyping(primary,primaryTid);
    const r1=await callClaude(BOT_SYSTEMS[BOTS.indexOf(primary)],msgs);
    removeTyping(primaryTid);
    appendBotMsg(primary,r1);

    // SECONDARY BOT optionally chimes in after a natural pause
    if(secondary){
      const msgs2=[...msgs,{role:'assistant',content:`[${primary.name}]: ${r1}`}];
      const delay=1800+Math.random()*1200;
      const secTid='typing-'+secondary.id;
      await new Promise(res=>setTimeout(res,delay));
      showTyping(secondary,secTid);
      const r2=await callClaude(BOT_SYSTEMS[BOTS.indexOf(secondary)],msgs2);
      removeTyping(secTid);
      appendBotMsg(secondary,r2);
    }
  }catch(e){
    removeTyping('typing-'+primary.id);
    if(secondary) removeTyping('typing-'+secondary.id);
    console.error('Chat error:',e);
    // Show a contextual retry message instead of generic error
    const retryMsgs=[
      "Sorry, I got a bit distracted — what were you saying?",
      "Could you repeat that? I want to make sure I understood.",
      "Hmm, I lost my train of thought. Can you say that again?",
      "My connection hiccuped — could you resend that?"
    ];
    const fallback=retryMsgs[Math.floor(Math.random()*retryMsgs.length)];
    appendBotMsg(primary, fallback);
  }finally{
    // Unlock
    chatLocked=false;
    const btn2=document.getElementById('send-btn');
    const input2=document.getElementById('chat-input');
    if(btn2) btn2.disabled=false;
    if(input2){ input2.disabled=false; input2.focus(); }
    // Show action buttons after 6 turns
    if(S.turns>=6){
      const ab=document.getElementById('chat-action-btns');
      if(ab){ ab.classList.remove('hidden'); ab.style.display='flex'; }
    }
  }
}
