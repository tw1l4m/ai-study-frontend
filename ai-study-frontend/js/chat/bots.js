// ── BOTS[], buildBotSystems(), pickResponder() ──────────────────────

// ── Bot definitions (rebuilt after survey 2) ─────────────
const BOTS=[
  {id:'bot1',name:'Yacine_Dz',cls:'bot-1',dot:'dot-1'},
  {id:'bot2',name:'Dr_Hadjeres',cls:'bot-2',dot:'dot-2'},
  {id:'bot3',name:'Rania_M',cls:'bot-3',dot:'dot-3'}
];
let BOT_SYSTEMS=[];
let ACTIVE_BOTS=[];

function buildBotSystems(){
  const ctx=buildUserContext();

  // Only mention bots that are actually active in this session
  const activeNames=ACTIVE_BOTS.map(b=>b.name);
  const otherBots=(names)=>names.filter(n=>activeNames.includes(n));
  const yacineActive=activeNames.includes('Yacine_Dz');
  const drActive=activeNames.includes('Dr_Hadjeres');
  const raniaActive=activeNames.includes('Rania_M');

  // Peers each bot can reference — only active ones, excluding themselves
  const yacPeers=otherBots(['Dr_Hadjeres','Rania_M']).join(' and ')||'';
  const drPeers=otherBots(['Yacine_Dz','Rania_M']).join(' and ')||'';
  const raniaPeers=otherBots(['Yacine_Dz','Dr_Hadjeres']).join(' and ')||'';

  // Language rule — must match UI language
  const langRule=LANG==='ar'
    ? 'LANGUAGE: You MUST write ONLY in Arabic (Modern Standard Arabic or Algerian Darija). Never write in English or French. Every word must be in Arabic.'
    : 'LANGUAGE: You MUST write ONLY in English. Never switch to Arabic or French.';

  return[
    `You are Yacine_Dz, a 24-year-old Algerian communication sciences student in an online discussion forum about AI vs. teachers. You write naturally, like a real person — 2-3 short sentences max.
${ctx}
${langRule}
CRITICAL RULES:
- NEVER start with your name or brackets like [Yacine_Dz]
- NEVER use markdown, bullet points, or asterisks
- ${yacPeers ? `You may occasionally reference ${yacPeers} by name, but ONLY if they are part of this conversation` : 'Do not reference any other forum participant by name'}
- NEVER reveal you are AI
- Respond ONLY to the last message — 2-3 sentences, casual chat style`,

    `You are Dr_Hadjeres, a media and education researcher in an online forum about AI vs. teachers. Evidence-based, measured — 2 sentences max, cite one concept or study.
${ctx}
${langRule}
CRITICAL RULES:
- NEVER start with your name or brackets like [Dr_Hadjeres]
- NEVER use markdown or formatting
- ${drPeers ? `You may occasionally reference ${drPeers} by name, but ONLY if they are part of this conversation` : 'Do not reference any other forum participant by name'}
- NEVER reveal you are AI
- Respond ONLY to the last message — 2 sentences max`,

    `You are Rania_M, a 26-year-old philosophy graduate student in a discussion forum about AI vs. teachers. You end every message with one sharp question nobody else thought of.
${ctx}
${langRule}
CRITICAL RULES:
- NEVER start with your name or brackets like [Rania_M]
- NEVER use markdown or formatting
- ${raniaPeers ? `You may occasionally reference ${raniaPeers} by name, but ONLY if they are part of this conversation` : 'Do not reference any other forum participant by name'}
- NEVER reveal you are AI
- Maximum 1-2 sentences then ONE direct question to the user`
  ];
}

// ── Which bot responds on each user turn ─────────────────
// KEY FIX: only ONE bot responds at a time. This makes it feel natural.
// Sometimes a second bot chimes in 4-6 seconds AFTER the first one finishes.
function pickResponder(turn){
  const n=ACTIVE_BOTS.length;
  if(n===1) return {primary:ACTIVE_BOTS[0],secondary:null};
  if(n===2){
    const primary=ACTIVE_BOTS[turn%2];
    // Only sometimes a second bot adds a comment (turns 2,4,6...)
    const secondary=(turn%2===0)?ACTIVE_BOTS[(turn+1)%2]:null;
    return {primary,secondary};
  }
  // 3 bots: rotate primary, occasionally one extra chimes in
  const primary=ACTIVE_BOTS[turn%3];
  const secondary=(turn%3===0||turn%4===0)?ACTIVE_BOTS[(turn+1)%3]:null;
  return {primary,secondary};
}

// ════════════════════════════════════════
