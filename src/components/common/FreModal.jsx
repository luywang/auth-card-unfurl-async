import { useEffect } from 'react'
import './FreModal.css'

// First-run-experience modal. Lightweight welcome-dialog layout:
//   1. Thin Teams-purple gradient accent strip at the very top
//   2. Centered title + subtitle, fixed at top of the content area
//   3. Scrollable body — caller-supplied via `children`
//   4. Fixed footer with a single primary dismiss button
// Click on the overlay or pressing Escape also dismisses. Demo/prototyping
// primitive — App.jsx controls when it shows.
export default function FreModal({
  title,
  subtitle,
  children,
  onDismiss,
  dismissLabel = 'Got it',
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onDismiss])

  return (
    <div className="fre-modal-overlay" onClick={onDismiss} role="presentation">
      <div
        className="fre-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fre-modal-title"
      >
        <div className="fre-modal-header">
          <div className="fre-modal-title-accent" aria-hidden="true" />
          <h2 id="fre-modal-title" className="fre-modal-title">{title}</h2>
          {subtitle && <p className="fre-modal-subtitle">{subtitle}</p>}
        </div>
        <div className="fre-modal-body">{children}</div>
        <div className="fre-modal-footer">
          <button type="button" className="fre-modal-dismiss" onClick={onDismiss}>
            {dismissLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
