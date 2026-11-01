import { useEffect, useState } from 'react'
import { getFileUrl } from '../lib/files.js'

export default function useFileUrl(bucket, path) {
  const [state, setState] = useState({ url: null, loading: Boolean(path) })

  useEffect(() => {
    if (!path) {
      setState({ url: null, loading: false })
      return undefined
    }
    let cancelled = false
    setState({ url: null, loading: true })
    getFileUrl(bucket, path)
      .then((url) => !cancelled && setState({ url, loading: false }))
      .catch(() => !cancelled && setState({ url: null, loading: false }))
    return () => {
      cancelled = true
    }
  }, [bucket, path])

  return state
}
