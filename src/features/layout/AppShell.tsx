import { Outlet } from 'react-router-dom'
import { AppNav } from './AppNav'
import { UpdatePrompt } from '../pwa/UpdatePrompt'

export function AppShell() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <AppNav />
      <main className="app-main" id="main" tabIndex={-1}>
        <UpdatePrompt />
        <Outlet />
      </main>
    </div>
  )
}
