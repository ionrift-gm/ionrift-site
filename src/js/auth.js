// ═══════════════════════════════════════════════════════════════
//  IONRIFT AUTH — Firebase wrapper
//  ─────────────────────────────────────────────────────────────
//  Setup:
//  1. console.firebase.google.com → create/select project
//  2. Authentication → Sign-in method → enable Google
//  3. Project settings → Add web app → copy firebaseConfig here
// ═══════════════════════════════════════════════════════════════

import { initializeApp }             from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider,
         onAuthStateChanged, signOut as fbSignOut }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// ─── REPLACE with your Firebase project config ────────────────
const FIREBASE_CONFIG = {
  apiKey:            "REPLACE_WITH_YOUR_API_KEY",
  authDomain:        "REPLACE_WITH_YOUR_PROJECT.firebaseapp.com",
  projectId:         "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket:     "REPLACE_WITH_YOUR_PROJECT.appspot.com",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId:             "REPLACE_WITH_YOUR_APP_ID",
};
// ──────────────────────────────────────────────────────────────

let _auth     = null;
let _provider = null;

export function initAuth() {
  if (_auth) return _auth;
  const app = initializeApp(FIREBASE_CONFIG);
  _auth     = getAuth(app);
  _provider = new GoogleAuthProvider();
  _provider.setCustomParameters({ prompt: 'select_account' });
  return _auth;
}

export function signIn()        { return signInWithPopup(_auth, _provider); }
export function signOutUser()   { return fbSignOut(_auth); }
export function getCurrentUser(){ return _auth?.currentUser ?? null; }
export function onAuthStateChange(cb) { return onAuthStateChanged(_auth, cb); }
