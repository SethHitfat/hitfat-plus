   Same flow as HITFAT HYBRID against the same Supabase project, so an athlete
   who already has a Hybrid account signs straight in — no second sign-up. ── */
let authMode='in';
function showAuth(){ $('auth').classList.add('on'); hideSplash(); }
function hideAuth(){ $('auth').classList.remove('on'); }
function authMsg(t,kind){ const m=$('auth-msg'); if(m){ m.textContent=t||''; m.className='authmsg'+(kind?' '+kind:''); } }
function authToggle(){
  authMode = authMode==='in' ? 'up' : 'in';
  $('auth-title').textContent = authMode==='in' ? 'Sign in' : 'Create account';
  $('auth-lead').textContent  = authMode==='in'
    ? 'Log in to sync your plan and progress across devices.'
    : 'One account for HITFAT+ — your progress follows you to any phone.';
  $('auth-submit').textContent = authMode==='in' ? 'Sign in' : 'Create account';
  $('auth-alt').innerHTML = authMode==='in'
    ? 'New here? <b>Create an account</b>' : 'Already have an account? <b>Sign in</b>';
  authMsg('');
}
function redirectURL(){ return location.origin + location.pathname; }
function signInGoogle(){ signInOAuth('google'); }
function signInOAuth(provider){
  if(!sb){ authMsg('Sign-in is not available offline.','err'); return; }
  authMsg('Opening '+provider+'…');
  sb.auth.signInWithOAuth({provider, options:{redirectTo:redirectURL()}})
    .then(r=>{ if(r&&r.error) authMsg(r.error.message,'err'); })
    .catch(e=>authMsg(String(e.message||e),'err'));
}
async function authSubmit(){
  if(!sb){ authMsg('Sign-in is not available offline.','err'); return; }
  const em=($('auth-email').value||'').trim(), pw=$('auth-pass').value||'';
  if(!em || !pw){ authMsg('Enter your email and password.','err'); return; }
  if(authMode==='up' && pw.length<6){ authMsg('Password needs at least 6 characters.','err'); return; }
  authMsg(authMode==='in'?'Signing in…':'Creating your account…');
  try{
    const r = authMode==='in'
      ? await sb.auth.signInWithPassword({email:em,password:pw})
      : await sb.auth.signUp({email:em,password:pw,options:{emailRedirectTo:redirectURL()}});
    if(r.error){ authMsg(r.error.message,'err'); return; }
    if(authMode==='up' && r.data && !r.data.session){ authMsg('Check your email to confirm your account.','ok'); return; }
  }catch(e){ authMsg(String(e.message||e),'err'); }
}
async function authForgot(){
  if(!sb) return;
  const em=($('auth-email').value||'').trim();
  if(!em){ authMsg('Enter your email first, then tap reset.','err'); return; }
  const r=await sb.auth.resetPasswordForEmail(em,{redirectTo:redirectURL()});
  authMsg(r.error?r.error.message:'Password reset sent — check your email.', r.error?'err':'ok');
}
async function signOut(){
  if(!sb) return;
  try{ await sb.auth.signOut(); }catch(e){}
  HF.setUser(null,null); HF.load(); _started=false;
  showAuth();
}
/* Name + email into the shared `profiles` table (already live for Hybrid).
   Wrapped so it is a no-op if the row or policy is not there yet. */
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
