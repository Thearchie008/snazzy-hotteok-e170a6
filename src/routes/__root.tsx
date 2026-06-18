import { HeadContent, Scripts, createRootRoute, Link, Outlet } from '@tanstack/react-router'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Eco Guardian — Grow Your Creatures' },
    ],
  }),
  shellComponent: RootDocument,
})

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium"
      activeProps={{ className: 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50' }}
    >
      {children}
    </Link>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-gray-950 text-gray-100">
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🌿</span>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
                Eco Guardian
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/garden">My Garden</NavLink>
              <NavLink to="/hatch">Hatch</NavLink>
              <NavLink to="/battle">Battle</NavLink>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <Scripts />
      </body>
    </html>
  )
}
