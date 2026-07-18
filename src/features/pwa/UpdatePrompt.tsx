import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (registration) {
        setInterval(() => {
          void registration.update()
        }, 60 * 60 * 1000)
      }
      void swUrl
    },
  })

  if (!needRefresh) return null

  return (
    <div className="update-banner" role="status">
      <span>An update is available.</span>
      <button
        type="button"
        className="btn btn--amber"
        onClick={() => {
          void updateServiceWorker(true)
          setNeedRefresh(false)
        }}
      >
        Refresh
      </button>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => setNeedRefresh(false)}
      >
        Later
      </button>
    </div>
  )
}
