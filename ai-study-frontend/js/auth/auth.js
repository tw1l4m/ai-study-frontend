// ── Auth UI: switchAuthTab, togglePw, checkPwStrength, loginUser, registerUser, onAuthSuccess, logoutUser

// ════════════════════════════════════════
//  AUTH UI
// ════════════════════════════════════════
function switchAuthTab(tab){
  ['login','register'].forEach(t=>{
    document.getElementById('tab-'+t).classList.toggle('active',t===tab);
    document.getElementById('panel-'+t).classList.toggle('active',t===tab);
  });
  document.querySelectorAll('[data-en]').forEach(el=>{const v=el.getAttribute('data-'+LANG);if(v!==null)el.innerHTML=v});
  document.querySelectorAll('[data-placeholder-en]').forEach(el=>{el.placeholder=el.getAttribute('data-placeholder-'+LANG)||''});
}
function togglePw(id,btn){
  const inp=document.getElementById(id);const isText=inp.type==='text';
  inp.type=isText?'password':'text';
  btn.textContent=isText?(LANG==='ar'?'إظهار':'SHOW'):(LANG==='ar'?'إخفاء':'HIDE');
}
function checkPwStrength(pw){
  const bars=[1,2,3].map(i=>document.getElementById('bar'+i));
  const lbl=document.getElementById('pw-label');
  bars.forEach(b=>b.className='pw-strength-bar');
  if(!pw){lbl.textContent='';return}
  let s=0;if(pw.length>=8)s++;if(/[A-Z]/.test(pw)&&/[a-z]/.test(pw))s++;if(/\d/.test(pw)||/[^A-Za-z0-9]/.test(pw))s++;
  const cls=['weak','medium','strong'][s-1]||'weak';
  bars.forEach((b,i)=>{if(i<s)b.classList.add(cls)});
  lbl.textContent=s===1?t('pwWeak'):s===2?t('pwMedium'):t('pwStrong');
}
function showAlert(id,type,msg){const el=document.getElementById(id);el.className='auth-alert '+type+' visible';el.textContent=msg}
function hideAlert(id){const el=document.getElementById(id);if(el){el.className='auth-alert';el.textContent=''}}
function setBtnLoading(id,loading,key){
  const btn=document.getElementById(id);btn.disabled=loading;
  if(loading)btn.innerHTML=`<span class="spinner"></span>${t(key)}`;
  else btn.innerHTML=btn.getAttribute('data-'+LANG)||btn.getAttribute('data-en');
}

async function loginUser(){
  const email=document.getElementById('login-email').value.trim().toLowerCase();
  const pw=document.getElementById('login-password').value;
  hideAlert('login-error');document.getElementById('login-already').classList.remove('visible');
  if(!email){showAlert('login-error','error',t('loginEmailRequired'));return}
  if(!pw){showAlert('login-error','error',t('loginPasswordRequired'));return}
  setBtnLoading('login-btn',true,'signingIn');
  try{
    const hash=await hashPw(pw);
    const user=await mFindUser(email);
    if(!user||user.passwordHash!==hash){showAlert('login-error','error',t('loginInvalid'));setBtnLoading('login-btn',false,null);document.getElementById('login-btn').innerHTML=document.getElementById('login-btn').getAttribute('data-'+LANG);return}
    if(user.studyCompleted){document.getElementById('login-already').classList.add('visible');setBtnLoading('login-btn',false,null);document.getElementById('login-btn').innerHTML=document.getElementById('login-btn').getAttribute('data-'+LANG);return}
    onAuthSuccess(user);
  }catch(e){console.error(e);showAlert('login-error','error',t('loginError'));setBtnLoading('login-btn',false,null);document.getElementById('login-btn').innerHTML=document.getElementById('login-btn').getAttribute('data-'+LANG)}
}

async function registerUser(){
  const fname=document.getElementById('reg-fname').value.trim();
  const lname=document.getElementById('reg-lname').value.trim();
  const email=document.getElementById('reg-email').value.trim().toLowerCase();
  const pw=document.getElementById('reg-password').value;
  const conf=document.getElementById('reg-confirm').value;
  let ok=true;
  const se=(id,show)=>{document.getElementById(id).classList.toggle('visible',show);if(show)ok=false};
  se('err-fname',!fname);se('err-lname',!lname);
  se('err-email',!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  se('err-password',pw.length<8);se('err-confirm',pw!==conf);
  hideAlert('register-error');hideAlert('register-success');
  if(!ok)return;
  setBtnLoading('register-btn',true,'creatingAccount');
  try{
    if(await mFindUser(email)){showAlert('register-error','error',t('registerEmailExists'));setBtnLoading('register-btn',false,null);document.getElementById('register-btn').innerHTML=document.getElementById('register-btn').getAttribute('data-'+LANG);return}
    const hash=await hashPw(pw);
    const user={email,passwordHash:hash,firstName:fname,lastName:lname,studyCompleted:false,createdAt:new Date().toISOString(),interfaceLang:LANG};
    await mInsertUser(user);
    showAlert('register-success','success',t('registerSuccess'));
    setTimeout(()=>onAuthSuccess(user),1000);
  }catch(e){console.error(e);showAlert('register-error','error',t('registerError'));setBtnLoading('register-btn',false,null);document.getElementById('register-btn').innerHTML=document.getElementById('register-btn').getAttribute('data-'+LANG)}
}

function onAuthSuccess(user){
  currentUser=user;
  const initials=((user.firstName||'?')[0]+(user.lastName||'?')[0]).toUpperCase();
  document.getElementById('topbar-avatar').textContent=initials;
  document.getElementById('topbar-name').textContent=`${user.firstName} ${user.lastName}`;
  document.getElementById('topbar-user').classList.add('visible');
  document.getElementById('stage-auth').classList.add('hidden');
  goTo(0);
}

function logoutUser(){
  currentUser=null;
  S={pid:null,reg:{},pre:{},mid:{},post:{},chat:[],turns:0,userStance:'neutral',botCount:1};
  document.getElementById('topbar-user').classList.remove('visible');
  ['login-email','login-password','reg-fname','reg-lname','reg-email','reg-password','reg-confirm'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
  hideAlert('login-error');hideAlert('register-error');hideAlert('register-success');
  document.getElementById('login-already').classList.remove('visible');
  checkPwStrength('');
  document.querySelectorAll('.stage').forEach(s=>s.classList.add('hidden'));
  document.getElementById('stage-auth').classList.remove('hidden');
  document.getElementById('progress-fill').style.width='0%';
  switchAuthTab('login');
  window.scrollTo({top:0,behavior:'smooth'});
}

// ════════════════════════════════════════
//  UI HELPERS
// ════════════════════════════════════════
