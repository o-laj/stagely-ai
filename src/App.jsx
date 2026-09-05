import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, signIn, logOut } from './firebase'
import JobBoard from './components/JobBoard.jsx'
import WordLogo from './assets/images/trans3.png'
import WordLogoHori from './assets/images/trans13.png'

export default function App() {
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setCheckingAuth(false)
    })
    return unsub
  }, [])

  if (checkingAuth) {
    return <div style={styles.centerScreen} />
  }

  if (!user) {
    return (
      <div style={styles.centerScreen}>
        <div className="job-sticky s1" style={{ ...styles.sticky, ...styles.s1 }}>
          <span style={styles.stickyLabel}>Applied</span>
          Frontend Eng · Paystack
        </div>
        <div className="job-sticky s2" style={{ ...styles.sticky, ...styles.s2 }}>
          <span style={styles.stickyLabel}>Interview</span>
          Backend Dev · Flutterwave
        </div>
        <div className="job-sticky s3" style={{ ...styles.sticky, ...styles.s3 }}>
          <span style={styles.stickyLabel}>Saved</span>
          SWE Intern · Moniepoint
        </div>
        <div className="job-sticky s4" style={{ ...styles.sticky, ...styles.s4 }}>
          <span style={styles.stickyLabel}>Stale · 9d</span>
          PM Role · Kuda
        </div>

        <div style={styles.loginCard}>
          <div style={styles.logoRow}>
            <img src={WordLogo} style={styles.wordLogo} alt="Stagely" />
          </div>

          <h1 className='wordmark' style={styles.wordmark}>
            Applied for a job.{' '}
            <span style={styles.highlightWrap}>
              Forgot it.
              <svg
                viewBox="0 0 200 20"
                preserveAspectRatio="none"
                style={styles.squiggle}
              >
                <path
                  d="M2 12 Q 50 2, 100 11 T 198 10"
                  stroke="#d4f547"
                  strokeWidth="7"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              </svg>
            </span>{' '}
            Not anymore.
          </h1>

          <p style={styles.sub}>
            Paste a job post, confirm 3 fields, move on. Stale applications get flagged
            automatically so nothing quietly disappears for a week.
          </p>

          <button style={styles.googleBtn} onClick={signIn}>
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 1024 1024"
              height="1.3em"
              width="1.3em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm167 633.6C638.4 735 583 757 516.9 757c-95.7 0-178.5-54.9-218.8-134.9C281.5 589 272 551.6 272 512s9.5-77 26.1-110.1c40.3-80.1 123.1-135 218.8-135 66 0 121.4 24.3 163.9 63.8L610.6 401c-25.4-24.3-57.7-36.6-93.6-36.6-63.8 0-117.8 43.1-137.1 101-4.9 14.7-7.7 30.4-7.7 46.6s2.8 31.9 7.7 46.6c19.3 57.9 73.3 101 137 101 33 0 61-8.7 82.9-23.4 26-17.4 43.2-43.3 48.9-74H516.9v-94.8h230.7c2.9 16.1 4.4 32.8 4.4 50.1 0 74.7-26.7 137.4-73 180.1z"></path>
            </svg>
            <span>&nbsp;Continue with Google</span>
          </button>

          <p className='trustLine' style={styles.trustLine}>
            <span style={styles.trustCheck}>✓</span> Free to use | No card required
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <header style={styles.header}>
        <span style={styles.eyebrowSmall}>
          <img src={WordLogoHori} style={styles.wordLogo} alt="Stagely" />
        </span>
        <div style={styles.headerRight}>
          <span style={styles.userEmail}>{user.email}</span>
          <button style={styles.logoutBtn} onClick={logOut}>
            Sign out
          </button>
        </div>
      </header>
      <JobBoard user={user} />

      <a
        href="https://o-laj-portfolio.web.app/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: 16,
          right: 20,
          color: 'var(--text-muted)',
          fontSize: 12,
          textDecoration: 'none',
        }}
      >
        Created By Juwone
      </a>
    </div>
  )
}

const styles = {
  centerScreen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  sticky: {
    position: 'absolute',
    width: 150,
    padding: '12px 14px',
    borderRadius: 6,
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 500,
    boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
    lineHeight: 1.4,
    zIndex: 1,
  },
  s1: { top: '10%', left: '6%', background: '#d4f547', color: '#10121a', animation: 'floatS1 4.2s ease-in-out infinite', animationDelay: '-1.1s' },
  s2: { top: '16%', right: '7%', background: '#6ec6ff', color: '#06222e', animation: 'floatS2 5s ease-in-out infinite', animationDelay: '-2.4s' },
  s3: { bottom: '14%', left: '9%', background: '#f5a3c7', color: '#3e0e22', animation: 'floatS3 4.6s ease-in-out infinite', animationDelay: '-0.6s' },
  s4: { bottom: '10%', right: '10%', background: '#ff8a65', color: '#3a1204', animation: 'floatS4 5.4s ease-in-out infinite', animationDelay: '-3s' },

  stickyLabel: {
    display: 'block',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    opacity: 0.7,
    marginBottom: 3,
  },
  loginCard: {
    maxWidth: 600,
    textAlign: 'center',
    position: 'relative',
    zIndex: 2,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  wordLogo: {
    width: '20vw',
  },
  betaBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10.5,
    color: '#10121a',
    background: 'var(--accent)',
    borderRadius: 20,
    padding: '3px 10px',
    transform: 'rotate(-4deg)',
    display: 'inline-block',
  },
  wordmark: {
    fontFamily: 'var(--font-display)',
    fontSize: 50,
    lineHeight: 1.25,
    margin: '0 0 16px',
  },
  highlightWrap: {
    position: 'relative',
    display: 'inline-block',
    color: 'var(--accent)',
  },
  squiggle: {
    position: 'absolute',
    left: -6,
    right: -6,
    bottom: -8,
    width: 'calc(100% + 12px)',
    height: 18,
  },
  sub: {
    color: 'var(--text-muted)',
    fontSize: 15,
    lineHeight: 1.6,
    marginBottom: 28,
  },
  googleBtn: {
    background: 'var(--accent)',
    color: '#10121a',
    border: 'none',
    borderRadius: 10,
    padding: '14px 26px',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    alignItems: 'center',
    margin: '0 auto',
    display: 'flex',
    boxShadow: '0 4px 0 #7a8025',
  },
  trustLine: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginTop: 16,
    fontFamily: 'var(--font-mono)',
  },
  trustCheck: {
    color: 'var(--accent)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid var(--border)',
  },
  eyebrowSmall: {
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontSize: 13,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  userEmail: {
    color: 'var(--text-muted)',
    fontSize: 13,
    fontFamily: 'var(--font-mono)',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-muted)',
    borderRadius: 6,
    padding: '6px 12px',
    fontSize: 13,
    cursor: 'pointer',
  },
}