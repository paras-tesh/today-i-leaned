import useFileUrl from '../hooks/useFileUrl.js'
import { publicUrl } from '../lib/files.js'

export function Cover({ course }) {
  return course.bannerPath
    ? <img className="cover" src={publicUrl(course.bannerPath)} alt={course.title} />
    : <div className="cover" />
}

export function Player({ bucket, path, kind }) {
  const { url, loading } = useFileUrl(bucket, path)
  if (loading) return null
  if (!url) return <p className="muted">فایل در دسترس نیست.</p>
  if (kind === 'audio') return <audio className="media" src={url} controls controlsList="nodownload" />
  return (
    <video
      className="media"
      src={url}
      controls
      controlsList="nodownload"
      disablePictureInPicture
      onContextMenu={(e) => e.preventDefault()}
    />
  )
}
