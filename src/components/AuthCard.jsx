// Auth card for targeted messages - prompts sender to sign in to complete unfurl.
// This is an adaptive card that appears in a private message from the service bot
// (Power BI) to the sender only.

import './AuthCard.css'

export default function AuthCard({ service, reportName, onSignIn, authType = 'fresh', isProcessing = false }) {
  return (
    <div className="auth-card">
      {/* Header */}
      <div className="auth-card-header">
        <div className="auth-card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#F2C811">
            <rect x="3" y="9" width="4" height="12" rx="0.5"/>
            <rect x="10" y="5" width="4" height="16" rx="0.5"/>
            <rect x="17" y="2" width="4" height="19" rx="0.5"/>
          </svg>
        </div>
        <div className="auth-card-title">{reportName || `${service} Report`}</div>
      </div>

      {/* Body */}
      <div className="auth-card-body">
        <p className="auth-card-text">
          {authType === 'sso'
            ? `To show a rich preview of your ${service} report, we need to verify your access. This will happen automatically.`
            : `To show a rich preview of your ${service} report in this conversation, sign in with your account.`
          }
        </p>
      </div>

      {/* Actions */}
      <div className="auth-card-actions">
        <button
          className="auth-card-action-primary"
          onClick={onSignIn}
          disabled={isProcessing}
        >
          {isProcessing ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </div>
  )
}
