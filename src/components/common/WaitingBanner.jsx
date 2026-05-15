// Yellow waiting banner shown while sender authentication is pending.
// Displayed while waiting for the current user to sign in for rich preview

import { Info } from './Icon'
import './WaitingBanner.css'

export default function WaitingBanner({ userName }) {
  return (
    <div className="waiting-banner">
      <Info size={16} stroke="#605E5C" />
      <span className="waiting-banner-text">
        Waiting for <strong>{userName}</strong> to sign in for a rich preview.
      </span>
    </div>
  )
}
