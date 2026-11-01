import { useEffect } from 'react'
import { Player } from './Media.jsx'
import { useApp } from '../context/AppContext.jsx'

export default function MediaModal() {
  const { media, closeMedia } = useApp()

  useEffect(() => {
    if (!media) return undefined
    const onKey = (e) => e.key === 'Escape' && closeMedia()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [media, closeMedia])

  if (!media) return null

  return (
    <div className="modal-overlay" onClick={closeMedia}>
      <div className="card modal" onClick={(e) => e.stopPropagation()}>
        <b>{media.title}</b>
        <div className="modal-body">
          <Player bucket={media.bucket} path={media.path} kind={media.kind} />
        </div>
        <button className="btn btn-sm" onClick={closeMedia}>بستن</button>
      </div>
    </div>
  )
}
