import { Link, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { signOut } from '../features/auth/authService'

interface HeaderProps {
  session: Session | null
  isLoadingSession: boolean
  authError: string | null
  onSignIn: () => void
}

export default function Header({ session, isLoadingSession, authError, onSignIn }: HeaderProps) {
  const { pathname } = useLocation()
  const userLabel =
    session?.user.email ?? session?.user.user_metadata?.user_name ?? session?.user.id

  return (
    <header className="sticky top-0 z-[100] flex items-center justify-between h-14 px-8 border-b border-[rgba(255,255,255,0.07)] bg-[rgba(14,16,18,0.85)] backdrop-blur-[12px]">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-[0.55rem] no-underline hover:no-underline"
      >
        <div className="size-7 rounded-[6px] bg-[#00d4dc] flex items-center justify-center flex-shrink-0">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <circle cx="7.5" cy="2" r="1.8" fill="#0a0c0d" />
            <circle cx="2.5" cy="12.5" r="1.8" fill="#0a0c0d" />
            <circle cx="12.5" cy="12.5" r="1.8" fill="#0a0c0d" />
            <line x1="7.5" y1="3.8" x2="2.5" y2="10.7" stroke="#0a0c0d" strokeWidth="1.4" />
            <line x1="7.5" y1="3.8" x2="12.5" y2="10.7" stroke="#0a0c0d" strokeWidth="1.4" />
          </svg>
        </div>
        <span className="text-[#eef0f3] text-[0.95rem] font-semibold tracking-[-0.01em]">
          Git Visualiser
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex items-center gap-1">
        <Link
          to="/"
          className={`text-[0.85rem] font-medium px-[10px] py-[5px] rounded-[5px] transition-colors duration-150 no-underline hover:no-underline ${
            pathname === '/'
              ? 'text-[#eef0f3] bg-[rgba(255,255,255,0.05)]'
              : 'text-[#9aa3b0] hover:text-[#eef0f3] hover:bg-[rgba(255,255,255,0.05)]'
          }`}
        >
          Home
        </Link>
        <Link
          to="/about"
          className={`text-[0.85rem] font-medium px-[10px] py-[5px] rounded-[5px] transition-colors duration-150 no-underline hover:no-underline ${
            pathname === '/about'
              ? 'text-[#00d4dc]'
              : 'text-[#9aa3b0] hover:text-[#eef0f3] hover:bg-[rgba(255,255,255,0.05)]'
          }`}
        >
          About
        </Link>

        {/* Auth chip */}
        {isLoadingSession ? null : session ? (
          <div className="flex items-center gap-[6px] ml-2 bg-[#161a1e] border border-[rgba(255,255,255,0.07)] rounded-full px-3 py-1">
            <span className="size-[7px] rounded-full bg-[#3fb950] flex-shrink-0" />
            <span className="font-mono text-[0.72rem] text-[#9aa3b0] max-w-[14rem] truncate">
              {userLabel}
            </span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="text-[0.72rem] text-[#6b7685] hover:text-[#00d4dc] transition-colors bg-transparent border-0 cursor-pointer p-0 ml-1 font-sans"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSignIn}
            className="ml-2 text-[0.82rem] font-medium text-[#9aa3b0] bg-transparent border border-[rgba(255,255,255,0.07)] rounded-full px-[14px] py-[5px] cursor-pointer hover:border-[#00d4dc] hover:text-[#00d4dc] transition-colors font-sans"
          >
            Sign in with GitHub
          </button>
        )}
      </nav>

      {/* Auth error banner */}
      {authError ? (
        <div className="absolute top-full left-0 right-0 bg-[#1c2128] border-b border-[rgba(255,255,255,0.07)] px-8 py-2">
          <p className="text-[#f87171] text-[0.82rem] m-0">{authError}</p>
        </div>
      ) : null}
    </header>
  )
}
