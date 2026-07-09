import { useState, useCallback } from 'react'
import { agentSessions as initialSessions, activityEvents as seedActivityEvents } from './data'
import NavRail from './components/NavRail'
import ChatList from './components/ChatList'
import ChatView from './components/ChatView'
import ActivityList from './components/ActivityList'
import TitleBar from './components/TitleBar'
import { FreModal } from './components/common'
import './App.css'

export default function App() {
  const [activeView, setActiveView] = useState('chat') // 'chat' | 'activity'
  const [activeChatId, setActiveChatId] = useState(35)
  const [readChatIds, setReadChatIds] = useState(() => new Set([35]))
  const [sessions, setSessions] = useState(initialSessions)
  const [dynamicSessionMessages, setDynamicSessionMessages] = useState({})
  // Activity feed: persist which events the user has opened so unread decorations clear.
  const [activityEvents, setActivityEvents] = useState(seedActivityEvents)
  const [activeActivityId, setActiveActivityId] = useState(null)
  // Demo walkthrough: 1 = chat 34, 2 = activity bell, 3 = chats, 4 = chat 35 again, 5 = sign in button
  // Step 0 (click into chat 35) is skipped — chat 35 is the default landing chat.
  const [demoStep, setDemoStep] = useState(1)
  // When navigating to a chat, optionally tell ChatView to open a specific
  // session (sessions rail), open a specific channel thread, or flash a
  // specific message so the user can see where a notification landed.
  const [navIntent, setNavIntent] = useState(null)
  // FRE shows on every load while iterating on the prototype — dismiss only
  // hides it for the current session. Swap to localStorage gating later if a
  // real first-run-only behavior is needed.
  const [showFre, setShowFre] = useState(true)
  const [freDismissed, setFreDismissed] = useState(false)
  // Auth flow option: 'option1' (private message) or 'option2' (public message, not yet implemented)
  const [authOption, setAuthOption] = useState('option2')

  const dismissFre = useCallback(() => {
    setShowFre(false)
    setFreDismissed(true)
  }, [])

  const handleViewChange = useCallback((view) => {
    setActiveView(view)
    // Advance demo step when correct nav item is clicked
    if (demoStep === 2 && view === 'activity') setDemoStep(3)
    else if (demoStep === 3 && view === 'chat') setDemoStep(4)
  }, [demoStep])

  const selectChat = useCallback((chatId) => {
    setActiveChatId(chatId)
    setReadChatIds(prev => (prev.has(chatId) ? prev : new Set(prev).add(chatId)))
    // Advance demo step when correct chat is clicked
    if (demoStep === 0 && chatId === 35) setDemoStep(1)
    else if (demoStep === 1 && chatId === 34) setDemoStep(2)
    else if (demoStep === 4 && chatId === 35) setDemoStep(5) // Show sign-in arrow
  }, [demoStep])

  const navigateToChat = useCallback((chatId, { showSessions, sessionId } = {}) => {
    selectChat(chatId)
    if (showSessions) setNavIntent({ chatId, sessionId: sessionId || null })
  }, [selectChat])

  const clearNavIntent = useCallback(() => setNavIntent(null), [])

  const addSession = useCallback((agentId, session, messages) => {
    setSessions(prev => ({
      ...prev,
      [agentId]: [session, ...(prev[agentId] || [])],
    }))
    if (messages) {
      setDynamicSessionMessages(prev => ({ ...prev, [session.id]: messages }))
    }
  }, [])

  const updateSession = useCallback((agentId, sessionId, updates) => {
    setSessions(prev => ({
      ...prev,
      [agentId]: (prev[agentId] || []).map(s =>
        s.id === sessionId ? { ...s, ...updates } : s
      ),
    }))
  }, [])

  const updateSessionMessages = useCallback((sessionId, messages) => {
    setDynamicSessionMessages(prev => ({ ...prev, [sessionId]: messages }))
  }, [])

  const addActivityEvent = useCallback((event) => {
    setActivityEvents(prev => [event, ...prev])
  }, [])

  const advanceDemoStep = useCallback(() => {
    if (demoStep === 5) setDemoStep(null) // Demo complete after sign-in
  }, [demoStep])

  const selectActivity = useCallback((event) => {
    setActiveActivityId(event.id)
    setActivityEvents(prev =>
      prev.map(e => (e.id === event.id && e.unread ? { ...e, unread: false } : e))
    )
    setActiveChatId(event.chatId)
    setReadChatIds(prev => (prev.has(event.chatId) ? prev : new Set(prev).add(event.chatId)))
    setNavIntent({
      chatId: event.chatId,
      channelThreadPostId: event.postId || null,
      highlightMessageId: event.messageId || null,
    })
  }, [])

  const activityUnreadCount = activityEvents.reduce((n, e) => n + (e.unread ? 1 : 0), 0)

  return (
    <div className="app">
      <TitleBar onShowFre={() => setShowFre(true)} />
      <div className="app-body">
        <NavRail
          activeView={activeView}
          onSelectView={handleViewChange}
          activityUnreadCount={activityUnreadCount}
          demoStep={demoStep}
          authOption={authOption}
        />
        {activeView === 'activity' ? (
          <ActivityList
            events={activityEvents}
            activeEventId={activeActivityId}
            onSelectEvent={selectActivity}
          />
        ) : (
          <ChatList
            activeChatId={activeChatId}
            onSelectChat={selectChat}
            readChatIds={readChatIds}
            demoStep={demoStep}
            authOption={authOption}
          />
        )}
        <ChatView
          activeChatId={activeChatId}
          onSelectChat={navigateToChat}
          sessions={sessions}
          addSession={addSession}
          updateSession={updateSession}
          updateSessionMessages={updateSessionMessages}
          dynamicSessionMessages={dynamicSessionMessages}
          navIntent={navIntent}
          clearNavIntent={clearNavIntent}
          addActivityEvent={addActivityEvent}
          demoStep={demoStep}
          onDemoStepAdvance={advanceDemoStep}
          authOption={authOption}
          freDismissed={freDismissed}
        />
      </div>
      {showFre && (
        <FreModal
          title="Async Link Unfurl with Auth"
          subtitle="Rich preview cards for authenticated content — even when you send too quickly."
          onDismiss={dismissFre}
        >
          <div className="fre-option-selector">
            <span className="fre-option-label">Select prototype option:</span>
            <label className="fre-radio-option">
              <input
                type="radio"
                name="auth-option"
                value="option1"
                checked={authOption === 'option1'}
                onChange={(e) => setAuthOption(e.target.value)}
              />
              Option 1: Private sign-in card sent by bot <span style={{fontWeight: 700, color: '#5C3317'}}>(ruled out)</span>
            </label>
            <label className="fre-radio-option">
              <input
                type="radio"
                name="auth-option"
                value="option2"
                checked={authOption === 'option2'}
                onChange={(e) => setAuthOption(e.target.value)}
              />
              Option 2: Public message w/ private banner <span className="fre-preferred">(preferred)</span>
            </label>
            <label className="fre-radio-option">
              <input
                type="radio"
                name="auth-option"
                value="option3"
                checked={authOption === 'option3'}
                onChange={(e) => setAuthOption(e.target.value)}
              />
              Option 3: Public message w/ private sign-in card
            </label>
          </div>

          <h3 className="fre-section-title">Today</h3>
          <p>
            When you share a link to authenticated content (like a Power BI report or private document),
            Teams tries to show a rich preview card. But this only works if authentication completes
            before you hit Send. If you send too quickly, everyone in the conversation sees a basic
            thumbnail instead of the rich preview — and there's no way to recover it.
          </p>

          <h3 className="fre-section-title">Problem</h3>
          <p>
            This creates a poor experience for everyone in the thread. Senders lose the opportunity
            to share rich, interactive content. Recipients never get to see the full context. Apps like
            Power BI lose engagement and virality. The current flow punishes users for being fast,
            which feels backwards.
          </p>

          <h3 className="fre-section-title">Three Authentication Approaches</h3>
          <p>
            This prototype demonstrates asynchronous link unfurling with post-send authentication.
            After you send a Power BI link, Teams attempts authentication in the background. If auth
            is needed, you can sign in after sending — the message then upgrades from a thumbnail
            to a rich preview for everyone in the conversation.
          </p>

          <h3 className="fre-section-title">Option 1: Private sign-in card sent by bot</h3>
          <p>
            You receive a <strong>private message</strong> from Power BI bot with a sign-in button.
            Only you see the auth prompt. After signing in, the original message upgrades to show
            the rich preview.
          </p>
          <p><strong>Pros:</strong></p>
          <ul className="fre-option-list">
            <li>Private auth flow keeps sign-in prompts out of conversation thread</li>
            <li>Dedicated bot chat provides persistent conversation history</li>
            <li>Reuse the auth card that's already built by the app</li>
          </ul>
          <p><strong>Cons:</strong></p>
          <ul className="fre-option-list">
            <li>Requires context switching between main chat and bot chat</li>
            <li>Adds another chat to manage (Power BI bot)</li>
            <li>Requires bot acquisition (no longer app-less)</li>
            <li>Private message expires in 24 hours (limitation of targeted messages)</li>
          </ul>

          <h3 className="fre-section-title">Option 2: Public message w/ private banner <span className="fre-preferred">(preferred)</span></h3>
          <p>
            A <strong>clickable yellow banner</strong> appears directly in the conversation thread.
            Only you can click it. After signing in via the banner, the message upgrades to show
            the rich preview.
          </p>
          <p><strong>Pros:</strong></p>
          <ul className="fre-option-list">
            <li>No context switching — auth happens in the same conversation</li>
            <li>More discoverable — banner is immediately visible where you sent the link</li>
            <li>Simpler UX — no separate bot chat to manage</li>
            <li>Banner expiry can be configured longer than 24 hours</li>
          </ul>
          <p><strong>Cons:</strong></p>
          <ul className="fre-option-list">
            <li>Banner visible to all participants (though only sender can click)</li>
            <li>May feel less private since others see the waiting state</li>
            <li>No persistent history of auth interactions</li>
          </ul>

          <h3 className="fre-section-title">Option 3: Public message w/ private sign-in card</h3>
          <p>
            An inline <strong>sign-in card</strong> appears directly in the conversation thread attached
            to your message. Only you can interact with it. After signing in, the original message upgrades
            to show the rich preview.
          </p>
          <p><strong>Pros:</strong></p>
          <ul className="fre-option-list">
            <li>No context switching — auth happens in the same conversation</li>
            <li>More discoverable — sign-in card is immediately visible where you sent the link</li>
            <li>Familiar card UI reused from the existing auth card pattern</li>
            <li>Card expiry can be configured longer than 24 hours</li>
          </ul>
          <p><strong>Cons:</strong></p>
          <ul className="fre-option-list">
            <li>Card visible to all participants (though only sender can interact)</li>
            <li>May feel less private since others see the waiting state</li>
            <li>No persistent history of auth interactions</li>
          </ul>

          <h3 className="fre-section-title">What this Unlocks</h3>
          <p>
            This restores the lost conversion funnel for apps like Power BI, Figma, and other authenticated
            content providers. It aligns with async-first collaboration patterns — send now, auth later.
            Most importantly, it maintains message integrity: everyone sees the same rich card in the same
            message, with no duplicates or confusion about which version is current.
          </p>
          <p>
            After watching the demo, you'll understand how post-send authentication can recover what
            would otherwise be a degraded sharing experience — and how targeted messages keep the auth
            flow private to the sender while the whole conversation benefits from the rich preview.
          </p>
        </FreModal>
      )}
    </div>
  )
}
