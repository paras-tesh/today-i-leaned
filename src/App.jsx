import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import MediaModal from './components/MediaModal.jsx'
import Toast from './components/Toast.jsx'
import useContentGuard from './hooks/useContentGuard.js'
import About from './pages/About.jsx'
import Admin from './pages/admin/Admin.jsx'
import Blog from './pages/Blog.jsx'
import Cart from './pages/Cart.jsx'
import Contact from './pages/Contact.jsx'
import Course from './pages/Course.jsx'
import Courses from './pages/Courses.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Panel from './pages/Panel.jsx'

export default function App() {
  const { pathname } = useLocation()
  useContentGuard()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<Course />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/panel" element={<Panel />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<main className="wrap"><h2>صفحه پیدا نشد</h2></main>} />
      </Routes>
      <Footer />
      <MediaModal />
      <Toast />
    </>
  )
}
