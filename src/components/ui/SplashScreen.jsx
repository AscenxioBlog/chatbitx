export function SplashScreen() {
  return (
    <div className="app-splash">
      <div className="app-splash-card">
        <p className="splash-eyebrow">Loading</p>
        <h1 className="splash-title">BitxBase</h1>
        <p className="splash-subtitle">Building together, sharing together.</p>
        <div className="splash-progress" aria-hidden="true">
          <span className="splash-progress-bar" />
        </div>
        <div className="splash-dots" aria-hidden="true">
          <span className="splash-dot" />
          <span className="splash-dot" />
          <span className="splash-dot" />
        </div>
      </div>
    </div>
  )
}
