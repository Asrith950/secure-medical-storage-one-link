import React, { useEffect, useState } from 'react';

// A modern, attractive splash screen shown while the app initializes/auth checks.
// Includes a pulsing medical cross, heartbeat line animation, and brand text.
export default function SplashScreen() {
  const [show, setShow] = useState(true);

  // Ensure a minimal display time to avoid flicker on fast loads
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="splash">
      <div className="splash-backdrop" />
      <div className="splash-card">
        <div className="splash-logo">
          <div className="cross">
            <div className="vert" />
            <div className="horiz" />
          </div>
          <div className="pulse" />
        </div>
        <div className="brand">SecureMed</div>
        <div className="tag">Smart Health Tracker</div>
        <div className="heartbeat">
          <span />
        </div>
        <div className="loading-text">Loading your experience…</div>
      </div>
    </div>
  );
}
