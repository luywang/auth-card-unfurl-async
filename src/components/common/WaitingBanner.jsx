// Yellow waiting banner shown while sender authentication is pending.
// Displayed while waiting for the current user to sign in for rich preview
// In Option 2, this becomes clickable for the current user to sign in directly

import { Info, Close } from './Icon'
import './WaitingBanner.css'

export default function WaitingBanner({ userName, isClickable = false, onClick, isProcessing = false, onDismiss }) {
  const Element = isClickable ? 'button' : 'div'

  const handleDismiss = (e) => {
    e.stopPropagation()
    onDismiss?.()
  }

  return (
    <Element
      className={`waiting-banner ${isClickable ? 'waiting-banner-clickable' : ''} ${isProcessing ? 'waiting-banner-processing' : ''}`}
      onClick={isClickable ? onClick : undefined}
      type={isClickable ? 'button' : undefined}
    >
      <Info size={16} stroke="#605E5C" />
      <span className="waiting-banner-text">
        {isClickable ? (
          <>
            <strong>{userName}</strong>, click here to sign in for a rich preview.
            {isProcessing && ' Signing in...'}
          </>
        ) : (
          <>
            Waiting for <strong>{userName}</strong> to sign in for a rich preview.
          </>
        )}
      </span>
      {onDismiss && (
        <button
          className="waiting-banner-dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          type="button"
        >
          <Close size={16} />
        </button>
      )}
    </Element>
  )
}
