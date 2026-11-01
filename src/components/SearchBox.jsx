import { useState } from 'react'
import Icon from './Icon.jsx'

export default function SearchBox({ initial = '', onSearch }) {
  const [query, setQuery] = useState(initial)

  const submit = (e) => {
    e.preventDefault()
    onSearch(query.trim())
  }

  return (
    <form className="search-box" onSubmit={submit}>
      <input
        placeholder="دنبال چه دوره‌ای می‌گردی؟"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" aria-label="جستجو">
        <Icon name="search" size={22} />
      </button>
    </form>
  )
}
