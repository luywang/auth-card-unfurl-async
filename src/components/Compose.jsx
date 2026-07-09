import { useState, useEffect } from 'react'
import { IconButton, Send, DemoArrow } from './common'
import { copilotLogo } from '../shared/assets'
import AuthCard from './AuthCard'
import './Compose.css'

// Splits text into alternating plain/URL segments for styled rendering.
function parseUrlSegments(text) {
  const regex = /(https?:\/\/[^\s]+)/g
  const segments = []
  let last = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) segments.push({ type: 'text', value: text.slice(last, match.index) })
    segments.push({ type: 'url', value: match[0] })
    last = match.index + match[0].length
  }
  if (last < text.length) segments.push({ type: 'text', value: text.slice(last) })
  return segments
}

// Main-canvas compose input. Sits below the chat messages. Handles a few
// specifics on top of a plain input:
//   • When a `/mention` is present (e.g. "/Jira …"), it's rendered as a
//     purple pill in front of the input; Backspace on an empty input clears it.
//   • When the value contains a URL, it's rendered with hyperlink styling
//     (blue + underline) in an overlay while the input is idle; focus clears
//     the overlay so the raw text is editable.
//   • Channels use "Start a new post" placeholder instead of "Type a message".
//
// All action buttons except Send are placeholder styling — wire them up
// when you need them for a prototype.
export default function Compose({
  value,
  mention,
  onChange,
  onClearMention,
  onSend,
  isChannel,
  freDismissed = false,
  onAuthDismiss,
}) {
  const [inputFocused, setInputFocused] = useState(false)
  const [showComposeAuth, setShowComposeAuth] = useState(false)
  const [showSendArrow, setShowSendArrow] = useState(true)
  const [countdown, setCountdown] = useState(null)

  const handleSend = () => {
    setShowSendArrow(false)
    onSend()
  }

  const urlSegments = parseUrlSegments(value)
  const hasUrl = urlSegments.some(s => s.type === 'url')

  // Count down 5→1 once a Power BI URL is in the box and FRE is dismissed.
  // When it hits 0 the sign-in card unfurls. Resets if the URL disappears.
  useEffect(() => {
    setShowComposeAuth(false)
    setCountdown(null)
    if (!hasUrl || !freDismissed) return

    setCountdown(10)
    let count = 10
    const id = setInterval(() => {
      count -= 1
      if (count > 0) {
        setCountdown(count)
      } else {
        setCountdown(null)
        setShowComposeAuth(true)
        clearInterval(id)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [hasUrl, freDismissed])
  const showUrlOverlay = hasUrl && !inputFocused

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && value === '' && mention) {
      e.preventDefault()
      onClearMention()
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  const placeholder = mention
    ? ''
    : isChannel ? 'Start a new post' : 'Type a message'

  return (
    <div className="chat-compose">
      <div className="compose-box-wrap">
        <div className={`compose-box${showComposeAuth ? ' compose-box--expanded' : ''}`}>
          <div className="compose-main-row">
            {mention && (
              <span className="mention compose-mention">/{mention}</span>
            )}
            <div className="compose-input-wrap">
              {showUrlOverlay && (
                <div
                  className="compose-url-overlay"
                  aria-hidden
                  onClick={() => document.querySelector('.compose-input')?.focus()}
                >
                  {urlSegments.map((seg, i) =>
                    seg.type === 'url'
                      ? <span key={i} className="compose-url-link">{seg.value}</span>
                      : <span key={i}>{seg.value}</span>
                  )}
                </div>
              )}
              <input
                type="text"
                className="compose-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                style={showUrlOverlay ? { color: 'transparent', caretColor: 'transparent' } : undefined}
              />
            </div>
            <div className="compose-actions">
              <button className="compose-btn" aria-label="Format">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 15l3-10 3 10M8 12h4"/>
                  <path d="M15 5l2 2"/>
                </svg>
              </button>
              <button className="compose-btn" aria-label="Emoji">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="10" cy="10" r="8"/>
                  <path d="M6.5 11.5s1.5 2 3.5 2 3.5-2 3.5-2"/>
                  <circle cx="7.5" cy="7.5" r=".75" fill="currentColor" stroke="none"/>
                  <circle cx="12.5" cy="7.5" r=".75" fill="currentColor" stroke="none"/>
                </svg>
              </button>
              <button className="compose-btn" aria-label="Attach">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 10.5l-5 5a3.54 3.54 0 0 1-5-5l7-7a2.36 2.36 0 0 1 3.33 3.33l-7 7a1.18 1.18 0 0 1-1.67-1.67l5-5"/>
                </svg>
              </button>
              <button className="compose-btn" aria-label="Copilot">
                <img src={copilotLogo} alt="Copilot" className="copilot-logo-img-sm" />
              </button>
              <button className="compose-btn" aria-label="More apps">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 3a.75.75 0 0 1 .75.75v5.5h5.5a.75.75 0 0 1 0 1.5h-5.5v5.5a.75.75 0 0 1-1.5 0v-5.5h-5.5a.75.75 0 0 1 0-1.5h5.5v-5.5A.75.75 0 0 1 10 3z"/>
                </svg>
              </button>
              <div className="compose-divider" />
              <div className="compose-send-wrap">
                {(showSendArrow || countdown !== null) && (
                  <div className="compose-send-hint" aria-hidden>
                    {countdown !== null && (
                      <span className="compose-countdown">
                        Send now for async unfurl in{' '}
                        <span className="compose-countdown-num">{countdown}</span>
                        {countdown === 1 ? ' second' : ' seconds'}
                      </span>
                    )}
                    {showSendArrow && <DemoArrow direction="down" size={20} />}
                  </div>
                )}
                <IconButton
                  label="Send"
                  className={`send-btn${(value.trim() || mention) ? ' send-btn--active' : ''}`}
                  onClick={handleSend}
                >
                  <Send />
                </IconButton>
              </div>
            </div>
          </div>
          {showComposeAuth && (
            <div className="compose-auth-card-inner">
              <AuthCard
                service="Power BI"
                reportName="Q2 Partner Adoption Dashboard"
                authType="sso"
                onSignIn={undefined}
                onDismiss={() => { setShowComposeAuth(false); onAuthDismiss?.() }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
