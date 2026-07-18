import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './features/layout/AppShell'
import { UserDataProvider } from './features/persistence/UserDataContext'

const HomePage = lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage })),
)
const CocktailsPage = lazy(() =>
  import('./pages/CocktailsPage').then((m) => ({ default: m.CocktailsPage })),
)
const CocktailDetailPage = lazy(() =>
  import('./pages/CocktailDetailPage').then((m) => ({
    default: m.CocktailDetailPage,
  })),
)
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const InventoryPage = lazy(() =>
  import('./features/inventory/InventoryPage').then((m) => ({
    default: m.InventoryPage,
  })),
)
const BottleDetailPage = lazy(() =>
  import('./features/inventory/BottleDetailPage').then((m) => ({
    default: m.BottleDetailPage,
  })),
)
const MakeSomethingPage = lazy(() =>
  import('./features/recommendations/MakeSomethingPage').then((m) => ({
    default: m.MakeSomethingPage,
  })),
)
const ShoppingListPage = lazy(() =>
  import('./features/shopping-list/ShoppingListPage').then((m) => ({
    default: m.ShoppingListPage,
  })),
)
const FavoritesPage = lazy(() =>
  import('./features/favorites/FavoritesPage').then((m) => ({
    default: m.FavoritesPage,
  })),
)
const DrinkHistoryPage = lazy(() =>
  import('./features/history/DrinkHistoryPage').then((m) => ({
    default: m.DrinkHistoryPage,
  })),
)
const JourneyPage = lazy(() =>
  import('./features/journey/JourneyPage').then((m) => ({
    default: m.JourneyPage,
  })),
)

function RouteFallback() {
  return (
    <p className="route-fallback" role="status">
      Loading…
    </p>
  )
}

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

export default function App() {
  return (
    <UserDataProvider>
      <BrowserRouter basename={routerBasename}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<HomePage />} />
              <Route path="cocktails" element={<CocktailsPage />} />
              <Route path="cocktails/:slug" element={<CocktailDetailPage />} />
              <Route path="bar" element={<InventoryPage />} />
              <Route path="bar/:bottleId" element={<BottleDetailPage />} />
              <Route path="make" element={<MakeSomethingPage />} />
              <Route path="shopping" element={<ShoppingListPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="history" element={<DrinkHistoryPage />} />
              <Route path="journey" element={<JourneyPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </UserDataProvider>
  )
}
