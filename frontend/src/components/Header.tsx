import { useLocation, useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { SiteHeader } from '@hillolbarman/ui'
import type { AuthUser } from '@hillolbarman/ui'
import { signOut } from '../features/auth/authService'

interface HeaderProps {
  session: Session | null
  isLoadingSession: boolean
  onSignIn: () => void
  authError: string | null
}

const logo = (
  <div className="size-7 rounded-[6px] bg-accent flex items-center justify-center flex-shrink-0">
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="2" r="1.8" fill="#0a0c0d" />
      <circle cx="2.5" cy="12.5" r="1.8" fill="#0a0c0d" />
      <circle cx="12.5" cy="12.5" r="1.8" fill="#0a0c0d" />
      <line x1="7.5" y1="3.8" x2="2.5" y2="10.7" stroke="#0a0c0d" strokeWidth="1.4" />
      <line x1="7.5" y1="3.8" x2="12.5" y2="10.7" stroke="#0a0c0d" strokeWidth="1.4" />
    </svg>
  </div>
)

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
]

export default function Header({ session, isLoadingSession, onSignIn, authError }: HeaderProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const currentUser: AuthUser | null = !isLoadingSession && session
    ? {
        id: session.user.id,
        name: session.user.user_metadata?.user_name ?? session.user.email ?? session.user.id,
        email: session.user.email ?? '',
      }
    : null

  function handleNavigate(to: string) {
    if (to === '/login' || to.startsWith('/login?')) {
      onSignIn()
    } else {
      navigate(to)
    }
  }

  return (
    <>
      <SiteHeader
        logo={logo}
        siteName="Git Visualiser"
        navItems={navItems}
        currentPath={pathname}
        currentUser={currentUser}
        onNavigate={handleNavigate}
        onLogout={() => void signOut()}
      />
      {authError ? (
        <div className="bg-[#1c2128] border-b border-[rgba(255,255,255,0.07)] px-4 sm:px-8 py-2">
          <p className="text-[#f87171] text-[0.82rem] m-0">{authError}</p>
        </div>
      ) : null}
    </>
  )
}
