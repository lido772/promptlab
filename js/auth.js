/**
 * Firebase Auth Module
 * Handles Google + Facebook OAuth via Firebase Authentication SDK v10
 * SDK loaded dynamically from CDN to avoid bundling
 */

// Firebase config — these are public client-side identifiers (safe to expose)
// Replace with your actual Firebase project values from console.firebase.google.com
const FIREBASE_CONFIG = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    appId: "YOUR_APP_ID"
};

let firebaseApp = null;
let firebaseAuth = null;
let GoogleAuthProvider = null;
let FacebookAuthProvider = null;
let signInWithPopup = null;
let firebaseSignOut = null;
let onAuthStateChangedFn = null;

let currentUser = null;
let authStateCallbacks = [];
let sdkLoaded = false;

/**
 * Dynamically load Firebase SDK modules from CDN
 */
async function loadFirebaseSDK() {
    if (sdkLoaded) return;

    try {
        const [appModule, authModule] = await Promise.all([
            import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js'),
            import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js')
        ]);

        const { initializeApp } = appModule;
        const {
            getAuth,
            GoogleAuthProvider: GoogleProvider,
            FacebookAuthProvider: FacebookProvider,
            signInWithPopup: popupSignIn,
            signOut: authSignOut,
            onAuthStateChanged: onAuthChanged
        } = authModule;

        firebaseApp = initializeApp(FIREBASE_CONFIG);
        firebaseAuth = getAuth(firebaseApp);
        GoogleAuthProvider = GoogleProvider;
        FacebookAuthProvider = FacebookProvider;
        signInWithPopup = popupSignIn;
        firebaseSignOut = authSignOut;
        onAuthStateChangedFn = onAuthChanged;

        // Listen for auth state changes
        onAuthStateChangedFn(firebaseAuth, (user) => {
            currentUser = user;
            authStateCallbacks.forEach(cb => {
                try { cb(user); } catch (e) { console.error('Auth callback error:', e); }
            });
        });

        sdkLoaded = true;
    } catch (err) {
        console.error('Failed to load Firebase SDK:', err);
        throw err;
    }
}

const Auth = {
    /**
     * Initialize Firebase Auth (loads SDK)
     */
    async init() {
        try {
            await loadFirebaseSDK();
        } catch (err) {
            console.warn('Firebase Auth unavailable:', err.message);
        }
    },

    /**
     * Sign in with Google popup
     */
    async signInWithGoogle() {
        if (!sdkLoaded) await loadFirebaseSDK();
        const provider = new GoogleAuthProvider();
        return signInWithPopup(firebaseAuth, provider);
    },

    /**
     * Sign in with Facebook popup
     */
    async signInWithFacebook() {
        if (!sdkLoaded) await loadFirebaseSDK();
        const provider = new FacebookAuthProvider();
        return signInWithPopup(firebaseAuth, provider);
    },

    /**
     * Sign out
     */
    async signOut() {
        if (!sdkLoaded || !firebaseAuth) return;
        return firebaseSignOut(firebaseAuth);
    },

    /**
     * Get current user's ID token for API calls
     * @returns {Promise<string|null>}
     */
    async getIdToken() {
        if (!currentUser) return null;
        try {
            return await currentUser.getIdToken();
        } catch (err) {
            console.error('Failed to get ID token:', err);
            return null;
        }
    },

    /**
     * Register callback for auth state changes
     * @param {Function} callback - Called with (user) or (null)
     */
    onAuthStateChanged(callback) {
        authStateCallbacks.push(callback);
        // Fire immediately with current state if SDK already loaded
        if (sdkLoaded) {
            try { callback(currentUser); } catch (e) { /* ignore */ }
        }
    },

    /**
     * Get simplified user info
     * @returns {Object|null}
     */
    getUserInfo() {
        if (!currentUser) return null;
        return {
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName,
            picture: currentUser.photoURL
        };
    },

    /**
     * Check if a user is currently logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        return currentUser !== null;
    }
};

export default Auth;
