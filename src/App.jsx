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
  const [activeChatId, setActiveChatId] = useState(1)
  const [readChatIds, setReadChatIds] = useState(() => new Set([1]))
  const [sessions, setSessions] = useState(initialSessions)
  const [dynamicSessionMessages, setDynamicSessionMessages] = useState({})
  // Activity feed: persist which events the user has opened so unread decorations clear.
  const [activityEvents, setActivityEvents] = useState(seedActivityEvents)
  const [activeActivityId, setActiveActivityId] = useState(null)
  // Demo walkthrough: 0 = chat 35, 1 = chat 34, 2 = activity bell, 3 = chats, 4 = chat 35 again
  const [demoStep, setDemoStep] = useState(0)
  // When navigating to a chat, optionally tell ChatView to open a specific
  // session (sessions rail), open a specific channel thread, or flash a
  // specific message so the user can see where a notification landed.
  const [navIntent, setNavIntent] = useState(null)
  // FRE shows on every load while iterating on the prototype — dismiss only
  // hides it for the current session. Swap to localStorage gating later if a
  // real first-run-only behavior is needed.
  const [showFre, setShowFre] = useState(true)

  const dismissFre = useCallback(() => setShowFre(false), [])

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
    else if (demoStep === 4 && chatId === 35) setDemoStep(null) // Demo complete
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
        />
      </div>
      {showFre && (
        <FreModal
          title="Async Link Unfurl with Auth"
          subtitle="Rich preview cards for authenticated content — even when you send too quickly."
          onDismiss={dismissFre}
        >
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

          <h3 className="fre-section-title">Solution</h3>
          <p>
            This prototype introduces asynchronous link unfurling with post-send authentication. After
            you send a link, Teams attempts authentication in the background. If auth is needed, you'll
            receive a private message from the service (like Power BI) prompting you to sign in. Once
            you complete authentication, the original message upgrades from a thumbnail to the full
            rich preview card — for everyone in the conversation.
          </p>
          <p>
            The demo includes two scenarios: SSO (silent auth that completes automatically) and Fresh
            Auth (manual sign-in required). Watch for the yellow "Please wait" banner, the targeted
            auth card from Power BI, and the seamless upgrade to the rich preview.
          </p>

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
