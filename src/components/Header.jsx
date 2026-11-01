import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { themes } from '../data/themes.js'
import { fa } from '../lib/format.js'

const links = [
  ['/', 'خانه'],
  ['/courses', 'دوره‌ها'],
  ['/blog', 'وبلاگ'],
  ['/about', 'دربارهٔ ما'],
  ['/contact', 'تماس'],
]

export default function Header() {
  const { user, cart, theme, setTheme, isAdmin } = useApp()
  const { pathname } = useLocation()
  const [themeOpen, setThemeOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest('.theme-picker')) setThemeOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const closeDrawer = () => setDrawerOpen(false)
  const accountLink = user ? ['/panel', 'پنل من'] : ['/login', 'ورود / ثبت‌نام']

  return (
    <>
      <header className="site-header">
        <div className="wrap header-row">
          <button className="icon-btn menu-btn" aria-label="منو" onClick={() => setDrawerOpen(true)}>
            <Icon name="menu" size={26} />
          </button>

          <Link to="/" className="brand">
            <img className="brand-mark" src="/mark.webp" alt="" />
            <span className="brand-name">رازهای آسمان</span>
          </Link>

          <nav className="main-nav">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <Link className="btn btn-sm desktop-only" to={accountLink[0]}>{accountLink[1]}</Link>
            <Link className="icon-btn" to="/cart" aria-label="سبد خرید">
              <Icon name="cart" size={22} />
              {cart.length > 0 && <span className="cart-count">{fa(cart.length)}</span>}
            </Link>
            {isAdmin && <Link className="btn btn-outline btn-sm desktop-only" to="/admin">پنل مدیریت</Link>}
            <div className="theme-picker">
              <button className="icon-btn" aria-label="انتخاب تم" onClick={() => setThemeOpen(!themeOpen)}>
                <Icon name="palette" size={22} />
              </button>
              {themeOpen && (
                <div className="theme-menu">
                  {themes.map(([key, label, color]) => (
                    <button
                      key={key}
                      className={theme === key ? 'active' : ''}
                      onClick={() => {
                        setTheme(key)
                        setThemeOpen(false)
                      }}
                    >
                      <i style={{ background: color }} />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {drawerOpen && (
        <div className="drawer-overlay" onClick={closeDrawer}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <Link className="drawer-top" to={accountLink[0]} onClick={closeDrawer}>
              {user ? 'پنل من' : 'ورود یا ثبت‌نام'}
            </Link>
            <div className="drawer-label">منو</div>
            {links.map(([to, label]) => (
              <Link
                key={to}
                className={'drawer-link' + (pathname === to ? ' active' : '')}
                to={to}
                onClick={closeDrawer}
              >
                <span>{label}</span>
                <Icon name="chevron" size={18} />
              </Link>
            ))}
            {isAdmin && (
              <Link className="drawer-link" to="/admin" onClick={closeDrawer}>
                <span>ورود به پنل مدیریت</span>
                <Icon name="chevron" size={18} />
              </Link>
            )}
          </aside>
        </div>
      )}
    </>
  )
}
