import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import useLocalState from '../hooks/useLocalState.js'
import { supabase } from '../lib/supabase.js'

const AppContext = createContext(null)

export const useApp = () => useContext(AppContext)

const toSession = (row) => ({
  id: row.id,
  chapter: row.chapter,
  title: row.title,
  description: row.description,
  minutes: row.minutes,
  videoPath: row.video_path,
  pdfPath: row.pdf_path,
  audioPath: row.audio_path,
})

const toCourse = (row) => ({
  id: row.id,
  title: row.title,
  level: row.level,
  price: row.price,
  summary: row.summary,
  features: row.features,
  published: row.published,
  bannerPath: row.banner_path,
  teaserPath: row.teaser_path,
  sessions: [...row.sessions].sort((a, b) => a.position - b.position).map(toSession),
})

const toReview = (row) => ({ id: row.id, name: row.name, text: row.body, status: row.status })

export function AppProvider({ children }) {
  const [theme, setTheme] = useLocalState('theme', 'minimal')
  const [cart, setCart] = useLocalState('cart', [])

  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [owned, setOwned] = useState([])
  const [progress, setProgress] = useState({})

  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [reviews, setReviews] = useState([])

  const [toast, setToast] = useState('')
  const [media, setMedia] = useState(null)
  const [redirectTo, setRedirectTo] = useState(null)
  const toastTimer = useRef()

  const userId = session?.user.id
  const user = session
    ? { id: userId, email: session.user.email, name: profile?.full_name || session.user.email.split('@')[0] }
    : null
  const accountLoading = authLoading || (Boolean(session) && !profileLoaded)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setIsAdmin(false)
      setOwned([])
      setProgress({})
      setProfileLoaded(false)
      return undefined
    }
    let cancelled = false
    Promise.all([
      supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle(),
      supabase.from('enrollments').select('course_id').eq('user_id', userId),
      supabase.from('lesson_progress').select('session_id'),
      supabase.rpc('is_admin'),
    ]).then(([profileRes, enrollRes, progressRes, adminRes]) => {
      if (cancelled) return
      setProfile(profileRes.data)
      setIsAdmin(adminRes.data === true)
      setOwned((enrollRes.data || []).map((r) => r.course_id))
      setProgress(Object.fromEntries((progressRes.data || []).map((r) => [r.session_id, true])))
      setProfileLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  const refreshCourses = useCallback(async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*, sessions(*)')
      .order('created_at', { ascending: true })
    if (!error) setCourses(data.map(toCourse))
    setCoursesLoading(false)
  }, [])

  const refreshReviews = useCallback(async () => {
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
    if (!error) setReviews(data.map(toReview))
  }, [])

  useEffect(() => {
    refreshCourses()
    refreshReviews()
  }, [refreshCourses, refreshReviews, userId])

  const notify = useCallback((message) => {
    clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }, [])

  const closeMedia = useCallback(() => setMedia(null), [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setSession(data.session)
  }

  // Resolves to false when the project asks for email confirmation first.
  const signUp = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) throw error
    setSession(data.session)
    return Boolean(data.session)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  const addToCart = (courseId) => {
    if (owned.includes(courseId)) return notify('این دوره را قبلاً دارید')
    if (!cart.includes(courseId)) setCart([...cart, courseId])
    notify('به سبد خرید اضافه شد')
  }

  const toggleLesson = async (sessionId) => {
    const done = Boolean(progress[sessionId])
    const previous = progress
    setProgress({ ...progress, [sessionId]: !done })
    const query = done
      ? supabase.from('lesson_progress').delete().eq('user_id', userId).eq('session_id', sessionId)
      : supabase.from('lesson_progress').insert({ user_id: userId, session_id: sessionId })
    const { error } = await query
    if (error) {
      setProgress(previous)
      notify('ذخیرهٔ پیشرفت انجام نشد')
    }
  }

  const deleteCourse = async (courseId) => {
    const { error } = await supabase.from('courses').delete().eq('id', courseId)
    if (error) throw error
    setCart(cart.filter((id) => id !== courseId))
    await refreshCourses()
  }

  const submitReview = async (text) => {
    const { error } = await supabase.from('reviews').insert({ user_id: userId, name: user.name, body: text })
    if (error) return false
    await refreshReviews()
    return true
  }

  const approveReview = async (id) => {
    const { error } = await supabase.from('reviews').update({ status: 'approved' }).eq('id', id)
    if (error) notify('تأیید انجام نشد')
    await refreshReviews()
  }

  const removeReview = async (id) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) notify('حذف انجام نشد')
    await refreshReviews()
  }

  const value = {
    theme, setTheme,
    user, isAdmin, accountLoading,
    signIn, signUp, signOut,
    cart, setCart, addToCart,
    owned,
    progress, toggleLesson,
    courses, coursesLoading, refreshCourses, deleteCourse,
    reviews, submitReview, approveReview, removeReview,
    toast, notify,
    media, openMedia: setMedia, closeMedia,
    redirectTo, setRedirectTo,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
