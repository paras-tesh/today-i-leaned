import { useEffect } from 'react'

const events = ['contextmenu', 'copy', 'dragstart']

// Stops the context menu and copying inside elements marked with .protected.
// Only a deterrent; real protection needs server-side access control.
export default function useContentGuard() {
  useEffect(() => {
    const block = (e) => {
      if (e.target.closest?.('.protected')) e.preventDefault()
    }
    events.forEach((name) => document.addEventListener(name, block))
    return () => events.forEach((name) => document.removeEventListener(name, block))
  }, [])
}
