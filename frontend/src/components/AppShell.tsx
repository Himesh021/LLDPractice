import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const links = [
  { to: "/problems", label: "Problems" },
  { to: "/history", label: "History" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const location = useLocation();
  const isWorkspace = /\/problems\/[^/]+\/practice$/.test(location.pathname);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className={isWorkspace ? "min-h-screen overflow-hidden bg-[var(--bg)]" : "min-h-screen bg-[var(--bg)]"}>
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color:var(--surface)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-2.5" aria-label="LLD Practice home">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--text-primary)] text-[10px] font-bold tracking-[0.16em] text-[var(--text-inverse)]">
              LLD
            </span>
            <span className="text-sm font-semibold tracking-[-0.02em] text-[var(--text-primary)]">LLD Practice</span>
          </NavLink>

          <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary navigation">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative inline-flex h-10 items-center rounded-lg px-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--surface-soft)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Toggle dark mode"
              onClick={() => setDarkMode((value) => !value)}
              className="btn-secondary h-10 w-10 rounded-lg p-0 text-base"
            >
              {darkMode ? "☀" : "☾"}
            </button>
            <button
              type="button"
              className="btn-secondary px-2.5 py-1.5 sm:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="sr-only">Toggle navigation</span>
              <span aria-hidden="true" className="text-sm font-medium">
                {open ? "Close" : "Menu"}
              </span>
            </button>
          </div>
        </div>

        {open ? (
          <nav id="mobile-nav" className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 sm:hidden" aria-label="Mobile navigation">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-[var(--surface-soft)] text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </nav>
        ) : null}
      </header>
      <main className={isWorkspace ? "h-[calc(100vh-4rem)] overflow-hidden" : ""}>{children}</main>
    </div>
  );
}
