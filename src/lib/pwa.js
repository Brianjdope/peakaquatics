let deferredInstallPrompt = null

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

export function bindInstallPrompt(onReady) {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredInstallPrompt = event
    onReady?.(true)
  })
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null
    onReady?.(false)
  })
}

export async function promptInstall() {
  if (!deferredInstallPrompt) return false
  deferredInstallPrompt.prompt()
  const choice = await deferredInstallPrompt.userChoice
  deferredInstallPrompt = null
  return choice?.outcome === 'accepted'
}
