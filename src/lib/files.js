import { supabase } from './supabase.js'

export const buckets = { public: 'course-public', private: 'course-private' }

export const extension = (file) => file.name.split('.').pop().toLowerCase()

export const publicUrl = (path) => supabase.storage.from(buckets.public).getPublicUrl(path).data.publicUrl

// Public files get a plain URL, private ones a signed link that expires after an hour.
export async function getFileUrl(bucket, path) {
  if (bucket === buckets.public) return publicUrl(path)
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600)
  if (error) throw error
  return data.signedUrl
}

export async function uploadFile(bucket, path, file, oldPath) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type || undefined })
  if (error) throw error
  if (oldPath) await supabase.storage.from(bucket).remove([oldPath])
  return path
}

export async function removeFolder(bucket, prefix) {
  const { data } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 })
  if (!data) return
  const files = []
  for (const entry of data) {
    if (entry.id) files.push(`${prefix}/${entry.name}`)
    else await removeFolder(bucket, `${prefix}/${entry.name}`)
  }
  if (files.length) await supabase.storage.from(bucket).remove(files)
}

export async function downloadPrivate(path, filename) {
  const { data, error } = await supabase.storage
    .from(buckets.private)
    .createSignedUrl(path, 60, { download: filename })
  if (error) return false
  const link = document.createElement('a')
  link.href = data.signedUrl
  link.click()
  return true
}
