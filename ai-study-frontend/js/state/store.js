// ── Global application state object S and flags ────────────────────

// ════════════════════════════════════════
//  STATE
// ════════════════════════════════════════
let S={pid:null,reg:{},pre:{},mid:{},post:{},chat:[],turns:0,userStance:'neutral',botCount:1};
let currentUser=null;
let chatLocked=false; // prevent double-send
