/* ═══════════════ AUTH ═══════════════
   Same flow as HITFAT HYBRID against the same Supabase project, so an athlete
   who already has a Hybrid account signs straight in — no second sign-up. ── */
let authMode='in';
function showAuth(){ authCollage(); if(typeof hfInAppNote==='function') hfInAppNote(); $('auth').classList.add('on'); hideSplash(); }
/* The Fitness+ way in: a collage of the training it opens, fading into
   the page. Drawn when shown, from the same photographs the app uses. */
function authCollage(){
  const el=$('auth-col'); if(!el || el.childNodes.length) return;
  let pics=[]; try{ pics=Object.values(IMG).slice(0,6); }catch(e){ /* the library is not loaded: no collage */ }
  el.innerHTML=pics.map(u=>'<div style="background-image:url(\''+u+'\')"></div>').join('');
}
function hideAuth(){ $('auth').classList.remove('on'); }
function authMsg(t,kind){ const m=$('auth-msg'); if(m){ m.textContent=t||''; m.className='authmsg'+(kind?' '+kind:''); } }
function authToggle(){
  authMode = authMode==='in' ? 'up' : 'in';
  $('auth-title').textContent = authMode==='in' ? 'Sign In' : 'Create Account';
  $('auth-lead').textContent  = authMode==='in'
    ? 'Log in to sync your plan and progress across devices.'
    : 'One account for HITFAT+ — your progress follows you to any phone.';
  $('auth-submit').textContent = authMode==='in' ? 'Sign In' : 'Create Account';
  $('auth-alt').innerHTML = authMode==='in'
    ? 'New here? <b>Create an account</b>' : 'Already have an account? <b>Sign in</b>';
  authMsg('');
}
function redirectURL(){ return location.origin + location.pathname; }
/* inside Instagram's or Facebook's browser Google answers "disallowed_useragent":
   point at the way out instead of sending them to that error */
function signInGoogle(){
  if(typeof hfInApp==='function' && hfInApp()){ hfInAppNote(); authMsg('Open HITFAT+ in '+(hfPhone()==='android'?'Chrome':'Safari')+' to sign in with Google.','err'); return; }
  signInOAuth('google');
}
function signInOAuth(provider){
  if(!sb){ authMsg('Sign-in is not available offline.','err'); return; }
  authMsg('Opening '+provider+'…');
  sb.auth.signInWithOAuth({provider, options:{redirectTo:redirectURL()}})
    .then(r=>{ if(r&&r.error) authMsg(r.error.message,'err'); })
    .catch(e=>authMsg(String(e.message||e),'err'));
}
/* ── A reset link lands here (11 Nov 2026). Before this, the link only signed the member in:
   nothing asked for a new password, so the next sign-in failed again. Now the link opens
   "New Password", saves it with updateUser, then carries on into the app. An expired or
   used link says so instead of sitting on Sign In. ── */
let authReset=null, authResetSaved=false;
function authResetShow(session){
  authReset=session||null; authMode='reset';
  showAuth();
  const em=(session&&session.user&&session.user.email)||'';
  $('auth-title').textContent='New Password';
  $('auth-lead').textContent='Choose a new password'+(em?' for '+em:'')+'. You will use it to sign in from now on.';
  ['.gbtn','.orline','#auth-email','#auth-alt','#auth-forgot'].forEach(s=>{ const e=document.querySelector('#auth '+s); if(e) e.style.display='none'; });
  const p=$('auth-pass'); if(p){ p.value=''; p.placeholder='New password (at least 6 characters)'; p.setAttribute('autocomplete','new-password'); }
  $('auth-submit').textContent='Save New Password';
  authMsg('');
}
function authResetDone(){
  authReset=null; authMode='in';
  ['.gbtn','.orline','#auth-email','#auth-alt','#auth-forgot'].forEach(s=>{ const e=document.querySelector('#auth '+s); if(e) e.style.display=''; });
  const p=$('auth-pass'); if(p){ p.value=''; p.placeholder='Password'; p.setAttribute('autocomplete','current-password'); }
  authMode='up'; authToggle();
}
/* the link's own words, read before the client tidies the address bar */
function authLinkState(h){
  h=String(h||'');
  if(/type=recovery/.test(h)) return 'recovery';
  if(/error_code=otp_expired|error_description=.*(expired|invalid)/i.test(h)) return 'expired';
  return '';
}
function authLinkExpired(){
  showAuth();
  authMsg('That reset link has expired or was already used. Enter your email and tap "Forgot your password?" for a new one.','err');
}
async function authSaveNewPass(){
  const pw=$('auth-pass').value||'';
  if(pw.length<6){ authMsg('Password needs at least 6 characters.','err'); return; }
  authMsg('Saving…');
  try{
    const r=await sb.auth.updateUser({password:pw});
    if(r.error){ authMsg(r.error.message,'err'); return; }
    const s=(await sb.auth.getSession()).data.session||authReset;
    authResetSaved=true; authResetDone();
    if(typeof toast==='function') toast('New password saved ✓');
    if(s) onSignedIn(s);
  }catch(e){ authMsg(String(e.message||e),'err'); }
}
/* Supabase's own words for a failed sign-in, said so a member knows what to try next */
function authNiceErr(m){
  m=String(m||'');
  if(/invalid login credentials/i.test(m)) return 'Email or password is not right. Joined with Google? Tap "Continue with Google" above. No account yet? Tap "Create an account".';
  if(/email not confirmed/i.test(m)) return 'Please confirm your email first: open the link we sent you, then sign in.';
  if(/already registered|already been registered/i.test(m)) return 'This email already has an account. Tap "Sign in" below, or "Continue with Google" if you joined with Google.';
  return m;
}
async function authSubmit(){
  if(!sb){ authMsg('Sign-in is not available offline.','err'); return; }
  if(authMode==='reset') return authSaveNewPass();
  const em=($('auth-email').value||'').trim(), pw=$('auth-pass').value||'';
  if(!em || !pw){ authMsg('Enter your email and password.','err'); return; }
  if(authMode==='up' && pw.length<6){ authMsg('Password needs at least 6 characters.','err'); return; }
  authMsg(authMode==='in'?'Signing in…':'Creating your account…');
  try{
    const r = authMode==='in'
      ? await sb.auth.signInWithPassword({email:em,password:pw})
      : await sb.auth.signUp({email:em,password:pw,options:{emailRedirectTo:redirectURL()}});
    if(r.error){ authMsg(authNiceErr(r.error.message),'err'); return; }
    if(authMode==='up' && r.data && !r.data.session){ authMsg('Check your email to confirm your account.','ok'); return; }
  }catch(e){ authMsg(String(e.message||e),'err'); }
}
async function authForgot(){
  if(!sb) return;
  const em=($('auth-email').value||'').trim();
  if(!em){ authMsg('Enter your email first, then tap reset.','err'); return; }
  authMsg('Sending…');
  const r=await sb.auth.resetPasswordForEmail(em,{redirectTo:redirectURL()});
  /* Supabase answers "sent" even when no account uses this email (so nobody can test which
     emails are members), and then nothing arrives. Say that plainly (11 Nov 2026: a MAK2FIT
     buyer reset a yahoo address that had no account; she had joined with Google on gmail). */
  authMsg(r.error?r.error.message:'If an account uses '+em+', a reset link is on its way. Nothing after 2 minutes? Check Spam. Joined with Google? Tap "Continue with Google" instead; there is no password to reset.', r.error?'err':'ok');
}
async function signOut(){
  if(!sb) return;
  try{ await sb.auth.signOut(); }catch(e){}
  HF.setUser(null,null); HF.load(); _started=false;
  showAuth();
}
/* Name + email into a shared `profiles` table. That table is live in Hybrid's
   project, not in this one — Plus has its own — so today every call here is a
   no-op the catch swallows, and nothing in Plus reads it back. The Club takes
   the member's name from auth.users metadata (see club_roster in
   11-club-checkin.sql), so do not add a read here expecting a row.

   It stays because it costs one request and starts working the day a
   `profiles` table exists, and because deleting it would look like a decision
   that names should not be shared across the two apps. That decision has not
   been made. */
async function syncProfile(session){
  if(!sb || !session || !session.user) return;
  try{
    await sb.from('profiles').upsert({
      id: session.user.id,
      email: session.user.email || null,
      name: (HF.data.prefs && HF.data.prefs.name) || null,
      updated_at: new Date().toISOString()
    },{onConflict:'id'});
  }catch(e){ /* table/policy not ready — harmless */ }
}
