import { useState, useRef, useEffect } from 'react'
import MessageRow from './MessageRow'
import { IconButton, ChevronLeft, Close, Dots, Send } from './common'
import './ChannelThreadRail.css'

// Right-pane thread view for a channel. Has two modes:
//   • Detail — root post + replies + compose. Header shows a back arrow and
//     the thread title.
//   • List — all threads in the current channel, click an item to open its
//     detail. Header reads "Threads".
// The back arrow on detail toggles to list; the X button closes the rail
// entirely. `initialPostId` opens the rail in detail mode for that post; if
// it changes from the outside (e.g. an Activity event re-targets the rail),
// the rail re-syncs to the new thread.
export default function ChannelThreadRail({ posts, initialPostId, activeContact, onClose }) {
  const [initialPostIdCursor, setInitialPostIdCursor] = useState(initialPostId)
  const [viewPostId, setViewPostId] = useState(initialPostId)
  if (initialPostIdCursor !== initialPostId) {
    setInitialPostIdCursor(initialPostId)
    setViewPostId(initialPostId)
  }

  const [extraRepliesByPost, setExtraRepliesByPost] = useState({})
  const [input, setInput] = useState('')
  const endRef = useRef(null)

  const post = viewPostId ? posts.find((p) => p.id === viewPostId) : null
  const extraReplies = post ? extraRepliesByPost[post.id] || [] : []
  const allReplies = post ? [...(post.replies || []), ...extraReplies] : []

  useEffect(() => {
    if (post) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [extraReplies, post?.id])

  const flattenSubject = (p) => {
    if (p.subject) return p.subject
    if (Array.isArray(p.text)) {
      return p.text.map((seg) => (typeof seg === 'string' ? seg : seg.name)).join('')
    }
    return p.text || ''
  }
  const titleText = post ? flattenSubject(post).replace(/\s+/g, ' ').trim() : 'Threads'

  const send = () => {
    const text = input.trim()
    if (!text || !post) return
    const now = new Date()
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    setExtraRepliesByPost((prev) => ({
      ...prev,
      [post.id]: [
        ...(prev[post.id] || []),
        { id: `reply-${Date.now()}`, senderId: 'me', text, time },
      ],
    }))
    setInput('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="channel-thread-rail">
      <div className="channel-thread-rail-header">
        <div className="channel-thread-rail-title-group">
          {post && (
            <IconButton
              label="Back to threads"
              className="channel-thread-rail-action channel-thread-rail-back"
              onClick={() => setViewPostId(null)}
            >
              <ChevronLeft size={18} />
            </IconButton>
          )}
          <div className="channel-thread-rail-title" title={titleText}>
            <span className="channel-thread-rail-title-subject">{titleText}</span>
          </div>
        </div>
        <div className="channel-thread-rail-actions">
          <IconButton label="More options" className="channel-thread-rail-action">
            <Dots size={16} />
          </IconButton>
          <IconButton label="Close" className="channel-thread-rail-action" onClick={onClose}>
            <Close />
          </IconButton>
        </div>
      </div>

      {post ? (
        <>
          <div className="channel-thread-rail-body">
            <div className="channel-thread-rail-messages">
              <MessageRow
                message={{ ...post, threadReply: undefined }}
                activeContact={activeContact}
              />
              {allReplies.map((reply) => (
                <MessageRow
                  key={reply.id}
                  message={reply}
                  activeContact={activeContact}
                />
              ))}
              <div ref={endRef} />
            </div>
          </div>

          <div className="channel-thread-rail-compose">
            <div className="channel-thread-rail-compose-box">
              <input
                type="text"
                className="channel-thread-rail-input"
                placeholder="Reply"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <IconButton label="Send" className="channel-thread-rail-send" onClick={send}>
                <Send />
              </IconButton>
            </div>
          </div>
        </>
      ) : posts.length === 0 ? (
        <div className="channel-thread-rail-body channel-thread-rail-body-empty">
          <div className="channel-thread-rail-empty">
            <div className="channel-thread-rail-empty-title">No threads yet</div>
            <div className="channel-thread-rail-empty-subtitle">
              Start a side conversation by selecting <em>Reply in thread</em> from any message
            </div>
          </div>
        </div>
      ) : (
        <div className="channel-thread-rail-body">
          <ul className="channel-thread-rail-list">
            {posts.map((p) => {
              const subject = flattenSubject(p).replace(/\s+/g, ' ').trim()
              const replyCount = (p.replies || []).length + (extraRepliesByPost[p.id]?.length || 0)
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    className="channel-thread-rail-list-item"
                    onClick={() => setViewPostId(p.id)}
                  >
                    <span className="channel-thread-rail-list-subject">{subject}</span>
                    <span className="channel-thread-rail-list-meta">
                      {p.time}
                      {replyCount > 0 && ` · ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
