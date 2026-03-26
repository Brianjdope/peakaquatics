import React, { useEffect, useState } from 'react'
import { bindInstallPrompt, promptInstall } from '../lib/pwa'

export default function InstallAppBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    bindInstallPrompt((ready) => setVisible(ready))
  }, [])

  if (!visible) return null

  return (
    <div className="install-banner" role="status">
      <p className="install-banner-text">Install Peak Aquatic Sports for faster booking on your phone.</p>
      <div className="install-banner-actions">
        <button
          className="install-btn install-btn-primary"
          onClick={async () => {
            await promptInstall()
            setVisible(false)
          }}
        >
          Install App
        </button>
        <button className="install-btn" onClick={() => setVisible(false)}>
          Not now
        </button>
      </div>
    </div>
  )
}
