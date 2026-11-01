import { useApp } from '../../context/AppContext.jsx'
import { fa } from '../../lib/format.js'

function ReviewRow({ review, onApprove, onRemove }) {
  return (
    <div className="card review-row">
      <div className="grow">
        <b>{review.name}</b>
        <p>{review.text}</p>
      </div>
      <span className="row-actions">
        {onApprove && <button className="btn btn-sm" onClick={onApprove}>تأیید</button>}
        <button className="btn btn-outline btn-sm" onClick={onRemove}>حذف</button>
      </span>
    </div>
  )
}

export default function ReviewsTab() {
  const { reviews, approveReview, removeReview } = useApp()
  const pending = reviews.filter((r) => r.status === 'pending')
  const approved = reviews.filter((r) => r.status === 'approved')

  return (
    <>
      <h3>در انتظار تأیید ({fa(pending.length)})</h3>
      {pending.length === 0 && <p className="muted">موردی برای بررسی نیست.</p>}
      {pending.map((r) => (
        <ReviewRow key={r.id} review={r} onApprove={() => approveReview(r.id)} onRemove={() => removeReview(r.id)} />
      ))}

      <h3>تأییدشده‌ها</h3>
      {approved.map((r) => (
        <ReviewRow key={r.id} review={r} onRemove={() => removeReview(r.id)} />
      ))}
    </>
  )
}
