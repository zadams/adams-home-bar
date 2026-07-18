import { NavLink } from 'react-router-dom'

const links: Array<{ to: string; label: string; end?: boolean }> = [
  { to: '/', label: 'Home', end: true },
  { to: '/cocktails', label: 'Cocktails' },
  { to: '/bar', label: 'My Bar' },
  { to: '/make', label: 'Make Something' },
  { to: '/shopping', label: 'Shopping List' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/history', label: 'History' },
  { to: '/journey', label: 'Journey' },
  { to: '/settings', label: 'Settings' },
]

export function AppNav() {
  return (
    <nav className="app-nav" aria-label="Main">
      <div className="app-nav__brand">
        <NavLink to="/" className="app-nav__brand-name" end>
          The Adams Home Bar
        </NavLink>
        <p className="app-nav__brand-sub">
          A Personal Cocktail Manual for the Spirits You Own
        </p>
      </div>
      <ul className="app-nav__list">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? 'app-nav__link app-nav__link--active' : 'app-nav__link'
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
