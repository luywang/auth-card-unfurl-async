import { currentUser } from '../data/contacts'
import { Avatar, ChevronLeft, ChevronRight, Info } from './common'
import './TitleBar.css'

export default function TitleBar({ onShowFre }) {
  return (
    <div className="title-bar">
      <div className="title-bar-left">
        {onShowFre && (
          <button
            className="title-btn"
            aria-label="Show welcome info"
            onClick={onShowFre}
          >
            <Info size={16} />
          </button>
        )}
      </div>

      <div className="title-bar-center">
        <div className="title-bar-nav-buttons">
          <button className="title-btn" aria-label="Back">
            <ChevronLeft size={16} />
          </button>
          <button className="title-btn" aria-label="Forward">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.5 7a4.5 4.5 0 1 0-1.77 3.56l3.61 3.61.7-.7-3.61-3.61A4.48 4.48 0 0 0 11.5 7zM7 10.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/>
          </svg>
          <span className="search-placeholder">Search or ask Copilot (Ctrl+E)</span>
        </div>
      </div>

      <div className="title-bar-right">
        <button className="title-btn" aria-label="More options">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
          </svg>
        </button>
        <div className="title-user-avatar" aria-label={currentUser.name}>
          <Avatar contact={currentUser} size={28} />
        </div>
      </div>
    </div>
  )
}
