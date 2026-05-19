// ── Language / i18n engine (EN + AR) + RTL switching ───────────────

// ════════════════════════════════════════
//  LANGUAGE
// ════════════════════════════════════════
let LANG='en';
function setLang(l){
  LANG=l;
  const h=document.getElementById('root-html');
  h.lang=l; h.dir=l==='ar'?'rtl':'ltr';
  document.getElementById('btn-en').classList.toggle('active',l==='en');
  document.getElementById('btn-ar').classList.toggle('active',l==='ar');
  document.querySelectorAll('[data-en]').forEach(el=>{const v=el.getAttribute('data-'+l);if(v!==null)el.innerHTML=v});
  document.querySelectorAll('[data-placeholder-en]').forEach(el=>{el.placeholder=el.getAttribute('data-placeholder-'+l)||''});
  document.getElementById('article-en').classList.toggle('hidden',l==='ar');
  document.getElementById('article-ar').classList.toggle('hidden',l==='en');
  ['pre-survey-questions','mid-survey-questions','post-survey-questions'].forEach(id=>{
    const el=document.getElementById(id);
    if(el&&el.innerHTML.trim()) renderSurvey(id,id.split('-')[0]);
  });
  updateTurnInfo();
  renderStanceBanner();
}

// ════════════════════════════════════════
//  TRANSLATIONS
// ════════════════════════════════════════
const T={
  en:{
    fillAll:'Please complete all fields.',
    acceptConsent:'Please accept the consent form first.',
    answerAll:'Please answer all questions.',
    confirmRead:'Please confirm you have read the article.',
    scaleLabels:['Strongly<br>Disagree','Disagree','Neutral','Agree','Strongly<br>Agree'],
    turnRemaining:n=>`${n} more exchange(s) required.`,
    turnDone:'Minimum reached. Proceed when ready.',
    youLabel:'You',
    connErr:"Lost connection for a moment — could you repeat that?",
    stanceProAI:'💡 Your answers suggest you lean toward trusting AI. The forum will explore this with you.',
    stanceProTeacher:'💡 Your answers suggest you value teachers over AI. The forum will help you build on this.',
    stanceNeutral:'💡 Your answers show a balanced view. The forum will push your thinking further.',
    loginEmailRequired:'Please enter your email.',
    loginPasswordRequired:'Please enter your password.',
    loginInvalid:'Incorrect email or password.',
    loginError:'Connection error. Please try again.',
    registerSuccess:'Account created! Signing you in…',
    registerEmailExists:'Email already registered. Please sign in.',
    registerError:'Registration failed. Please try again.',
    pwWeak:'Weak',pwMedium:'Fair',pwStrong:'Strong',
    signingIn:'Signing in…',creatingAccount:'Creating account…',
  },
  ar:{
    fillAll:'يرجى إكمال جميع الحقول.',
    acceptConsent:'يرجى قبول نموذج الموافقة أولاً.',
    answerAll:'يرجى الإجابة على جميع الأسئلة.',
    confirmRead:'يرجى تأكيد قراءة المقال.',
    scaleLabels:['لا أوافق<br>بشدة','لا أوافق','محايد','أوافق','أوافق<br>بشدة'],
    turnRemaining:n=>`تبادلات متبقية: ${n}`,
    turnDone:'تم الحد الأدنى. يمكنك المتابعة.',
    youLabel:'أنت',
    connErr:'انقطع الاتصال للحظة — هل يمكنك الإعادة؟',
    stanceProAI:'💡 إجاباتك تشير إلى ميلك للثقة بالذكاء الاصطناعي. سيستكشف المنتدى هذا معك.',
    stanceProTeacher:'💡 إجاباتك تشير إلى تقديرك للأساتذة. سيساعدك المنتدى في بناء هذا الرأي.',
    stanceNeutral:'💡 إجاباتك تُظهر رأياً متوازناً. سيدفع المنتدى تفكيرك أبعد.',
    loginEmailRequired:'يرجى إدخال البريد الإلكتروني.',
    loginPasswordRequired:'يرجى إدخال كلمة المرور.',
    loginInvalid:'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    loginError:'خطأ في الاتصال.',
    registerSuccess:'تم إنشاء الحساب!',
    registerEmailExists:'البريد مسجّل مسبقاً.',
    registerError:'فشل إنشاء الحساب.',
    pwWeak:'ضعيفة',pwMedium:'متوسطة',pwStrong:'قوية',
    signingIn:'جارٍ الدخول…',creatingAccount:'جارٍ الإنشاء…',
  }
};
const t=(k,...a)=>{const v=T[LANG][k];return typeof v==='function'?v(...a):v};
