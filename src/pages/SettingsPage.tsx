import { useRef, useState } from 'react'
import { useUserData } from '../features/persistence/UserDataContext'

export function SettingsPage() {
  const { userData, exportJson, importJson, resetData } = useUserData()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{
    type: 'ok' | 'error'
    text: string
  } | null>(null)

  const download = (filename: string, payload: unknown) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExport = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `adams-home-bar-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage({ type: 'ok', text: 'Full backup downloaded.' })
  }

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text()
      importJson(text)
      setMessage({ type: 'ok', text: 'Backup imported successfully.' })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Import failed.',
      })
    }
  }

  const handleReset = () => {
    if (
      window.confirm(
        'Reset all local app data? Seeded recipes and inventory remain; overrides, shopping list, favorites, and history clear.',
      )
    ) {
      resetData()
      setMessage({ type: 'ok', text: 'Local data reset.' })
    }
  }

  return (
    <div>
      <header className="page-header">
        <p className="page-header__eyebrow">App</p>
        <h1 className="page-header__title">Settings</h1>
        <p className="page-header__lede">
          Install on your iPad, back up local data, and restore from JSON.
        </p>
      </header>

      <div className="settings-panel">
        <section>
          <h2>Install on iPad</h2>
          <ol className="install-steps">
            <li>Open this site in Safari (use HTTPS or localhost).</li>
            <li>Tap Share.</li>
            <li>Select Add to Home Screen.</li>
            <li>
              Launch from the home-screen icon for the full-screen bar
              experience.
            </li>
          </ol>
          <p>
            Deployment notes live in <code>DEPLOY.md</code>.
          </p>
        </section>

        <section>
          <h2>Backup & restore</h2>
          <p>
            Full export includes inventory overrides, shopping list, favorites,
            ratings, notes, history, journey progress, and recently viewed.
            Imports are validated before applying — malformed files never erase
            good data.
          </p>
          <div className="settings-actions">
            <button type="button" className="btn" onClick={handleExport}>
              Export all JSON
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() =>
                download('adams-home-bar-shopping.json', {
                  exportedAt: new Date().toISOString(),
                  shoppingList: userData.shoppingList,
                })
              }
            >
              Export shopping list
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() =>
                download('adams-home-bar-history.json', {
                  exportedAt: new Date().toISOString(),
                  history: userData.history,
                  cocktailMeta: userData.cocktailMeta,
                })
              }
            >
              Export tasting history
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => fileRef.current?.click()}
            >
              Import JSON
            </button>
            <button type="button" className="btn btn--ghost" onClick={handleReset}>
              Reset local data
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleImportFile(file)
                e.target.value = ''
              }}
            />
          </div>
          {message && (
            <p
              className={`settings-message settings-message--${message.type}`}
              role="status"
            >
              {message.text}
            </p>
          )}
        </section>

        <section>
          <h2>About this build</h2>
          <ul>
            <li>Static PWA — no account or backend.</li>
            <li>Recipes and seed inventory are version-controlled JSON.</li>
            <li>Illustrations are placeholders ready for replacement art.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
