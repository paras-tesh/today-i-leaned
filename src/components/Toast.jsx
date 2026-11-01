import { useApp } from '../context/AppContext.jsx'

export default function Toast() {
  const { toast } = useApp()
  return toast ? <div className="toast">{toast}</div> : null
}
