import { useEffect, useState } from 'react'
import { readJson, writeJson } from '../lib/storage.js'

export default function useLocalState(key, initial) {
  const [value, setValue] = useState(() => readJson(key, initial))
  useEffect(() => writeJson(key, value), [key, value])
  return [value, setValue]
}
