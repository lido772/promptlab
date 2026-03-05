import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { user, signInWithGoogle, signInWithFacebook, signOut } = useAuth();

  return (
    <header className="text-center py-16 px-5 bg-gradient-to-b from-surface/10 to-transparent border-b border-border mb-16">
      <div className="container">
        <h1 className="text-4xl md:text-5xl font-semibold mb-2.5 text-gradient">
          ✨ PromptUp
        </h1>
        <p className="text-foreground-muted text-base mt-2.5">
          Test, optimize & master your AI prompts
        </p>

        {/* Auth Container */}
        <div className="flex items-center justify-center gap-3 mt-4 min-h-10">
          {user ? (
            <>
              {/* User Info */}
              <div className="flex items-center gap-2.5 text-foreground text-sm">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border-2 border-accent/40"
                  />
                )}
                <span className="font-semibold text-foreground">
                  {user.displayName || user.email}
                </span>
              </div>

              {/* History Toggle Button */}
              <button
                onClick={() => document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary px-4 py-2 text-sm"
              >
                My History
              </button>

              {/* Sign Out Button */}
              <button
                onClick={signOut}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              {/* Google Sign In */}
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-background-base rounded-lg text-sm font-semibold shadow-card hover:-translate-y-0.5 transition-all duration-200 ease-expo-out"
              >
                <span className="font-bold text-base">G</span>
                <span>Sign in with Google</span>
              </button>

              {/* Facebook Sign In */}
              <button
                onClick={signInWithFacebook}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1877F2] text-white rounded-lg text-sm font-semibold shadow-card hover:-translate-y-0.5 transition-all duration-200 ease-expo-out"
              >
                <span className="font-bold text-base">f</span>
                <span>Sign in with Facebook</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
