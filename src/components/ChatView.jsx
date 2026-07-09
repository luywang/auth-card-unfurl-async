import { useState, useEffect, useRef } from 'react'
import {
  messagesByContact,
  contacts,
  favorites,
  projectNorthwind,
  chatList,
  channelPostsByContact,
  sessionMessages,
  promptSuggestions,
  copilotAgent,
  designerAgent,
  pollyAgent,
  breakthuAgent,
  powerBILinkTemplate,
} from '../data'
import { TypingIndicator, DemoArrow } from './common'
import MessageRow from './MessageRow'
import SessionsRail from './SessionsRail'
import AgentsRail from './AgentsRail'
import PromptSuggestions from './PromptSuggestions'
import ChannelThreadRail from './ChannelThreadRail'
import ChatHeader from './ChatHeader'
import Compose from './Compose'
import './ChatView.css'

// Convert a channel post (root + replies) into the message shape MessageRow
// expects, attaching a threadReply badge built from the replies' unique
// senders. Replies themselves are not shown in the main canvas — clicking the
// badge opens ChannelThreadRail.
function postToMessage(post) {
  const replyCount = post.replies?.length || 0
  if (!replyCount) return { ...post }
  const seen = new Set()
  const participantIds = []
  for (const r of post.replies) {
    if (seen.has(r.senderId)) continue
    seen.add(r.senderId)
    participantIds.push(r.senderId)
    if (participantIds.length === 3) break
  }
  return { ...post, threadReply: { participantIds, count: replyCount } }
}

function parseDraft(d) {
  const m = d.match(/^\/Jira\b\s*/i)
  return m ? { mention: 'Jira', text: d.slice(m[0].length) } : { mention: null, text: d }
}

// ── Scripted Jira demo flow (disabled) ─────────────────────────────────────
// Kept as a reference pattern for scripted agent flows. Flip JIRA_FLOW_ENABLED
// and restore the `draft: '/Jira …'` entry in chatList to re-enable. See
// CLAUDE.md for policy on this flow.
const JIRA_FLOW_ENABLED = false

const jiraScript = [
  {
    text: 'You have 1 blocker for the April 25 milestone — the PR is in review with all signoffs and CI passing. Want me to merge it?',
    link: {
      source: 'jira',
      title: 'Handle delegation timeout during agent handoff',
      subtitle: 'JIRA-4552 · In review · Due April 22',
      url: '#',
    },
    seed: 'Yes',
  },
  {
    text: 'Merged — here\'s the PR:',
    link: {
      source: 'github',
      title: 'Handle delegation timeout during agent handoff',
      subtitle: 'teams/agent-handoff #4552 · Merged',
      url: '#',
    },
    seed: null,
  },
]

export default function ChatView({
  activeChatId,
  onSelectChat,
  sessions,
  addSession,
  updateSession,
  updateSessionMessages,
  dynamicSessionMessages,
  navIntent,
  clearNavIntent,
  addActivityEvent,
  demoStep,
  onDemoStepAdvance,
  authOption = 'option1',
  freDismissed = false,
}) {
  const activeContact = contacts.find((c) => c.id === activeChatId)
  const baseMessages = messagesByContact[activeChatId] || []
  const participantCount = activeContact.isGroup || activeContact.isChannel
    ? activeContact.memberCount ?? new Set(baseMessages.map((m) => m.senderId)).size
    : 2
  const allChats = [...favorites, ...projectNorthwind, ...chatList]
  const chatEntry = allChats.find((c) => c.contactId === activeChatId)
  const draft = chatEntry?.draft || ''
  const parsedDraft = parseDraft(draft)

  const isAgent = activeContact.isAgent && !activeContact.isGroup
  const isChannel = !!activeContact.isChannel
  const isGroup = !!activeContact.isGroup
  let channelPosts = isChannel ? channelPostsByContact[activeChatId] || [] : null
  const hasSessions = isAgent && sessions[activeChatId]

  // Power BI async unfurl flow state
  const [powerBIStates, setPowerBIStates] = useState({}) // Track state per message: { chatId-messageId: 'thumbnail' | 'waiting' | 'auth-pending' | 'rich' }
  const [targetedAuthMessages, setTargetedAuthMessages] = useState([]) // Targeted messages from Power BI bot
  const [processingAuthKey, setProcessingAuthKey] = useState(null) // Track which auth button is currently processing
  const [dismissedBanners, setDismissedBanners] = useState(new Set()) // Track dismissed waiting banners by messageKey

  // Merge Power BI states into channel posts
  if (channelPosts) {
    channelPosts = channelPosts.map((post) => {
      if (!post.powerBILink) return post
      const stateKey = `${activeChatId}-${post.id}`
      const state = powerBIStates[stateKey] || post.powerBILink.state
      return {
        ...post,
        powerBILink: {
          ...post.powerBILink,
          state,
          messageKey: stateKey,
        },
      }
    })
  }

  const [extraMessages, setExtraMessages] = useState({})
  const [inputValue, setInputValue] = useState(parsedDraft.text)
  const [composeMention, setComposeMention] = useState(parsedDraft.mention)
  const [composeAuthDismissed, setComposeAuthDismissed] = useState(false)
  const [showSessions, setShowSessions] = useState(hasSessions)
  const [showAgents, setShowAgents] = useState(false)
  const [selectedRailAgent, setSelectedRailAgent] = useState(null)
  const [agentChatMessages, setAgentChatMessages] = useState({})
  const [railComposeHint, setRailComposeHint] = useState(null)
  const [railTypingAgentId, setRailTypingAgentId] = useState(null)
  const [railJiraStep, setRailJiraStep] = useState(0)
  const [jiraGroupSessionId, setJiraGroupSessionId] = useState(null)
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [jiraThreadAnchorId, setJiraThreadAnchorId] = useState(null)
  const [mainTypingAgentId, setMainTypingAgentId] = useState(null)
  const [channelThreadPostId, setChannelThreadPostId] = useState(null)
  const [threadRailOpen, setThreadRailOpen] = useState(false)
  const [highlightMessageId, setHighlightMessageId] = useState(null)
  const messagesEndRef = useRef(null)

  // Reset per-chat ephemeral state when activeChatId changes. Using the
  // render-phase state-adjustment pattern (rather than useEffect) avoids the
  // cascade-render warning and lands the new state in the first paint.
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [chatIdCursor, setChatIdCursor] = useState(activeChatId)
  const [navIntentCursor, setNavIntentCursor] = useState(navIntent)
  if (chatIdCursor !== activeChatId) {
    setChatIdCursor(activeChatId)
    setInputValue(parsedDraft.text)
    setComposeMention(parsedDraft.mention)
    setShowAgents(false)
    setSelectedRailAgent(null)
    setRailJiraStep(0)
    setRailComposeHint(null)
    setRailTypingAgentId(null)
    setJiraThreadAnchorId(null)
    setChannelThreadPostId(null)
    setThreadRailOpen(false)
    setHighlightMessageId(null)
    const intentMatches = navIntent && navIntent.chatId === activeChatId
    const intentHasSession = intentMatches && 'sessionId' in navIntent
    if (intentHasSession) {
      setShowSessions(true)
      setActiveSessionId(navIntent.sessionId || null)
    } else {
      setShowSessions(!!hasSessions)
      const agentSessionList = sessions[activeChatId]
      setActiveSessionId(agentSessionList?.length > 0 ? agentSessionList[0].id : null)
    }
    if (intentMatches && navIntent.channelThreadPostId) {
      setChannelThreadPostId(navIntent.channelThreadPostId)
      setThreadRailOpen(true)
    }
    if (intentMatches && navIntent.highlightMessageId) {
      setHighlightMessageId(navIntent.highlightMessageId)
    }
    if (intentMatches) clearNavIntent()
  } else if (navIntent !== navIntentCursor && navIntent?.chatId === activeChatId) {
    setNavIntentCursor(navIntent)
    if ('sessionId' in navIntent) {
      setShowSessions(true)
      if (navIntent.sessionId) setActiveSessionId(navIntent.sessionId)
    }
    if (navIntent.channelThreadPostId) {
      setChannelThreadPostId(navIntent.channelThreadPostId)
      setThreadRailOpen(true)
    }
    if (navIntent.highlightMessageId) {
      setHighlightMessageId(navIntent.highlightMessageId)
    }
    clearNavIntent()
  }

  const sessionMsgs = activeSessionId && (dynamicSessionMessages[activeSessionId] || sessionMessages[activeSessionId])
  const displayBaseMessages = sessionMsgs || baseMessages
  // Per-session bucket for in-canvas messages so switching to a new pending
  // session starts with a blank canvas instead of inheriting the previous
  // session's messages. Non-session chats fall back to the chat id.
  const canvasKey = activeSessionId || activeChatId

  useEffect(() => {
    if (highlightMessageId) {
      // Activity-navigation: scroll the triggering message into view and
      // flash it briefly so the user sees where the notification landed.
      const el = document.querySelector(
        `[data-message-id="${CSS.escape(String(highlightMessageId))}"]`
      )
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('message-row-highlight')
        const t = setTimeout(() => {
          el.classList.remove('message-row-highlight')
          setHighlightMessageId(null)
        }, 1800)
        return () => clearTimeout(t)
      }
      return
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [extraMessages, activeChatId, activeSessionId, mainTypingAgentId, highlightMessageId])

  // Mirror the rail's Jira thread messages back into the source chat's
  // session so the conversation is discoverable from Jira's sessions list.
  useEffect(() => {
    if (!jiraGroupSessionId) return
    const msgs = agentChatMessages[4] || []
    const converted = msgs
      .filter((m) => !String(m.id).startsWith('intro-'))
      .map((m) => ({
        id: m.id,
        senderId: m.from === 'me' ? 'me' : 4,
        text: m.text,
        time: m.time,
        link: m.link,
      }))
    updateSessionMessages(jiraGroupSessionId, converted)
  }, [agentChatMessages, jiraGroupSessionId, updateSessionMessages])

  // Power BI async unfurl flow - simulates the auth-then-unfurl progression
  useEffect(() => {
    const allMessages = [...displayBaseMessages, ...(extraMessages[canvasKey] || [])]
    allMessages.forEach((msg) => {
      if (!msg.powerBILink) return
      const stateKey = `${activeChatId}-${msg.id}`
      const currentState = powerBIStates[stateKey]

      // Initial state: start the delayed flow. Immediately mark as 'loading'
      // so this branch only fires once — subsequent effect runs see currentState
      // as 'loading' (truthy) and skip.
      if (!currentState && msg.powerBILink.state === 'thumbnail') {
        setPowerBIStates((prev) => ({ ...prev, [stateKey]: 'loading' }))

        if (authOption === 'option2' || authOption === 'option3') {
          // 2s delay, then reveal thumbnail + banner together
          setTimeout(() => {
            setPowerBIStates((prev) => ({ ...prev, [stateKey]: 'auth-pending' }))
          }, 2000)
        } else {
          // Option 1 — two-phase reveal:
          // Phase 1 (t+2s): show thumbnail only
          setTimeout(() => {
            setPowerBIStates((prev) => ({ ...prev, [stateKey]: 'thumbnail' }))
            setMainTypingAgentId(34) // Power BI bot starts "typing"
          }, 2000)

          // Phase 2 (t+5s): stop typing, send private auth message
          setTimeout(() => {
            setMainTypingAgentId((prev) => (prev === 34 ? null : prev))
            setPowerBIStates((prev) => ({ ...prev, [stateKey]: 'auth-pending' }))

            const authMsg = {
              id: `auth-${stateKey}`,
              senderId: 34,
              text: '',
              time: nowTimeStr(),
              isAuthCard: true,
              authType: msg.powerBILink.authType || 'sso',
              targetMessageKey: stateKey,
              reportName: msg.powerBILink.report?.title || 'Power BI Report',
            }
            setTargetedAuthMessages((prev) => [...prev, authMsg])

            const reminderMsg = {
              id: `reminder-${stateKey}`,
              senderId: 34,
              text: [
                { type: 'mention', name: 'Alex Morgan' },
                ' Please sign in within 24 hours to allow rich preview. The sign-in card will be deleted after 24 hours if not used.'
              ],
              time: nowTimeStr(),
            }
            setExtraMessages((prev) => ({
              ...prev,
              34: [...(prev[34] || []), authMsg, reminderMsg]
            }))

            if (addActivityEvent) {
              addActivityEvent({
                id: `activity-${stateKey}`,
                type: 'mention',
                actorId: 34,
                chatId: 34,
                messageId: `reminder-${stateKey}`,
                time: nowTimeStr(),
                unread: true,
              })
            }
          }, 5000)
        }
      }
    })
  }, [displayBaseMessages, extraMessages, canvasKey, activeChatId, powerBIStates])

  // Handle manual auth sign-in for Fresh Auth flow (Option 1 - private message)
  const handlePowerBISignIn = (messageKey) => {
    // Set processing state to show loading indicator
    setProcessingAuthKey(messageKey)

    // Process for a few seconds before completing
    setTimeout(() => {
      setPowerBIStates((prev) => ({ ...prev, [messageKey]: 'rich' }))
      // Remove targeted message after processing
      setTargetedAuthMessages((prev) => prev.filter((m) => m.targetMessageKey !== messageKey))
      // Update chat 34 (Power BI bot chat) - remove auth card, edit reminder message
      setExtraMessages((prev) => ({
        ...prev,
        34: (prev[34] || [])
          .filter((m) => m.targetMessageKey !== messageKey)
          .map((m) => m.id === `reminder-${messageKey}`
            ? { ...m, text: 'Sign-in provided. Thank you!', edited: true }
            : m
          )
      }))
      // Clear processing state
      setProcessingAuthKey(null)
      // Advance demo step if on step 5
      if (onDemoStepAdvance) onDemoStepAdvance()
    }, 2500)
  }

  // Handle banner click for Option 2 (public message auth)
  const handleBannerSignIn = (messageKey) => {
    // Set processing state
    setProcessingAuthKey(messageKey)

    // Process for a few seconds before completing
    setTimeout(() => {
      setPowerBIStates((prev) => ({ ...prev, [messageKey]: 'rich' }))
      // Clear processing state
      setProcessingAuthKey(null)
      // Advance demo step if on step 5
      if (onDemoStepAdvance) onDemoStepAdvance()
    }, 2500)
  }

  // Handle banner dismiss
  const handleBannerDismiss = (messageKey) => {
    setDismissedBanners((prev) => new Set([...prev, messageKey]))
  }

  // Trigger message sequence after rich card appears (chat 35 demo flow)
  useEffect(() => {
    const stateKey = `${activeChatId}-pbi-chat35`
    const isRich = powerBIStates[stateKey] === 'rich'

    if (activeChatId === 35 && isRich && !extraMessages[canvasKey]?.some(m => m.id === 'pbi-4')) {
      // Define the message sequence
      const messageSequence = [
        { id: 'pbi-4', senderId: 1, text: 'Week 4 uptick looks solid. Is that organic or did we push a cohort through?', time: 'Today 9:05 AM' },
        { id: 'pbi-5', senderId: 7, text: 'Organic — most of it came from the SDK v2 preview release. Onboarding time dropped ~40%.', time: 'Today 9:07 AM' },
        { id: 'pbi-6', senderId: 'me', text: 'Exactly. The worked examples in the docs made a big difference.', time: 'Today 9:08 AM' },
      ]

      // Add messages one by one with typing indicators
      messageSequence.forEach((msg, index) => {
        const delay = index * 2500

        // Show typing indicator (except for 'me')
        if (msg.senderId !== 'me') {
          setTimeout(() => {
            setMainTypingAgentId(msg.senderId)
          }, delay)
        }

        // Add message and hide typing indicator
        setTimeout(() => {
          setExtraMessages((prev) => ({
            ...prev,
            [canvasKey]: [...(prev[canvasKey] || []), msg]
          }))
          if (msg.senderId !== 'me') {
            setMainTypingAgentId(null)
          }
        }, delay + 2500)
      })
    }
  }, [activeChatId, powerBIStates, canvasKey, extraMessages])

  let messages = [...displayBaseMessages, ...(extraMessages[canvasKey] || [])]

  // Merge in Power BI unfurl states
  messages = messages.map((msg) => {
    if (!msg.powerBILink) return msg
    const stateKey = `${activeChatId}-${msg.id}`
    const state = powerBIStates[stateKey] || msg.powerBILink.state
    return {
      ...msg,
      powerBILink: {
        ...msg.powerBILink,
        state,
      },
    }
  })

  // Add targeted auth messages from Power BI bot in chats that have Power BI links
  // Insert each auth message right after the message it targets
  const relevantAuthMessages = targetedAuthMessages.filter((authMsg) =>
    authMsg.targetMessageKey.startsWith(`${activeChatId}-`)
  )
  if (relevantAuthMessages.length > 0) {
    // Build a map of targetMessageKey -> auth message for quick lookup
    const authMessageMap = new Map(
      relevantAuthMessages.map((authMsg) => [authMsg.targetMessageKey, authMsg])
    )

    // Insert auth messages right after their target messages
    const messagesWithAuth = []
    for (const msg of messages) {
      messagesWithAuth.push(msg)
      const stateKey = `${activeChatId}-${msg.id}`
      const authMsg = authMessageMap.get(stateKey)
      if (authMsg) {
        messagesWithAuth.push(authMsg)
      }
    }
    messages = messagesWithAuth
  }
  // Messages with `replies` arrays power the threads list/detail view in
  // group chats. Channels use channelPosts for the same purpose.
  const groupThreadablePosts = isGroup ? messages.filter((m) => m.replies?.length > 0) : []

  const activeSession = hasSessions && sessions[activeChatId]?.find((s) => s.id === activeSessionId)
  const sourceChat = activeSession?.sourceChatId ? contacts.find((c) => c.id === activeSession.sourceChatId) : null

  const { agentsInConversation, recommendedAgents } = (() => {
    if (activeChatId === 11) {
      const jira = contacts.find((c) => c.id === 4)
      return {
        agentsInConversation: [copilotAgent, jira, designerAgent],
        recommendedAgents: [pollyAgent, breakthuAgent],
      }
    }
    const agentsById = new Map(contacts.filter((c) => c.isAgent).map((a) => [a.id, a]))
    const agentsByName = new Map(contacts.filter((c) => c.isAgent).map((a) => [a.name.toLowerCase(), a]))
    const found = new Map()
    if (activeContact.isAgent) found.set(activeContact.id, activeContact)
    for (const m of baseMessages) {
      if (agentsById.has(m.senderId)) found.set(m.senderId, agentsById.get(m.senderId))
      if (Array.isArray(m.text)) {
        for (const part of m.text) {
          if (part && typeof part === 'object' && part.type === 'mention') {
            const agent = agentsByName.get(part.name.toLowerCase())
            if (agent) found.set(agent.id, agent)
          }
        }
      }
    }
    return { agentsInConversation: Array.from(found.values()), recommendedAgents: [] }
  })()

  const handleNewSession = () => {
    // Only one pending "New conversation" per agent — if one already exists,
    // just switch to it instead of creating another. It becomes a real session
    // once the user sends their first message (see finalizePendingSession).
    const existingPending = (sessions[activeChatId] || []).find((s) => s.isPending)
    if (existingPending) {
      setActiveSessionId(existingPending.id)
      return
    }
    const now = new Date()
    const sessionId = `s-new-${Date.now()}`
    const newSession = {
      id: sessionId,
      name: 'New conversation',
      time: now.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      preview: '',
      isPending: true,
    }
    addSession(activeChatId, newSession, [])
    setActiveSessionId(sessionId)
  }

  const finalizePendingSession = (firstText, nameHint) => {
    if (!isAgent || !activeSessionId) return
    const current = (sessions[activeChatId] || []).find((s) => s.id === activeSessionId)
    if (!current?.isPending) return
    const trimmed = String(firstText || '').trim()
    const name = (nameHint && nameHint.trim()) || trimmed.slice(0, 60) || 'New conversation'
    const preview = trimmed.slice(0, 100)
    const now = new Date()
    updateSession(activeChatId, activeSessionId, {
      name,
      preview,
      time: now.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      isPending: false,
    })
  }

  const nowTimeStr = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  const selectRailAgent = (agent) => {
    setSelectedRailAgent(agent)
    if (agent && !agentChatMessages[agent.id]) {
      const intro = {
        id: `intro-${agent.id}`,
        from: 'agent',
        text: `Hi! I'm ${agent.name}. Ask me anything in the context of ${activeContact.name}.`,
        time: nowTimeStr(),
      }
      setAgentChatMessages((prev) => ({ ...prev, [agent.id]: [intro] }))
    }
  }

  const bumpThreadReply = (anchorId, participantId) => {
    if (!anchorId) return
    setExtraMessages((prev) => {
      const list = prev[activeChatId] || []
      if (!list.some((m) => m.id === anchorId)) return prev
      return {
        ...prev,
        [activeChatId]: list.map((m) => {
          if (m.id !== anchorId) return m
          const existingIds = m.threadReply?.participantIds || []
          const participantIds = existingIds.includes(participantId)
            ? existingIds
            : [...existingIds, participantId]
          return {
            ...m,
            threadReply: {
              participantIds,
              count: (m.threadReply?.count || 0) + 1,
            },
          }
        }),
      }
    })
  }

  const scheduleJiraResponse = (index, anchorIdOverride) => {
    if (index < 0 || index >= jiraScript.length) return
    // Callers that just queued a setJiraThreadAnchorId in the same tick pass
    // the id explicitly; otherwise fall back to the latest committed state.
    const anchorId = anchorIdOverride ?? jiraThreadAnchorId
    setRailTypingAgentId(4)
    setTimeout(() => {
      const step = jiraScript[index]
      const jiraMsg = {
        id: `l2j-${Date.now()}`,
        from: 'agent',
        text: step.text,
        link: step.link,
        time: nowTimeStr(),
      }
      setAgentChatMessages((prev) => ({ ...prev, [4]: [...(prev[4] || []), jiraMsg] }))
      setRailTypingAgentId(null)
      setRailComposeHint(step.seed ? { agentId: 4, text: step.seed } : null)
      setRailJiraStep(index + 1)
      bumpThreadReply(anchorId, 4)

      if (index === jiraScript.length - 1) {
        setInputValue('Had 1 blocker, but just merged the fix — all set now!')
        setComposeMention(null)
      }
    }, 3200)
  }

  const sendInRail = (text) => {
    if (!selectedRailAgent) return
    const agentId = selectedRailAgent.id
    setAgentChatMessages((prev) => ({
      ...prev,
      [agentId]: [...(prev[agentId] || []), { id: `l2-${Date.now()}`, from: 'me', text, time: nowTimeStr() }],
    }))
    setRailComposeHint(null)
    // User replies on the Jira thread count too (and pull the current user's
    // avatar into the reply indicator).
    if (agentId === 4) bumpThreadReply(jiraThreadAnchorId, 'me')
    if (agentId === 4 && railJiraStep > 0 && railJiraStep < jiraScript.length) {
      scheduleJiraResponse(railJiraStep)
    }
  }

  const openJiraThread = () => {
    // The reply indicator acts as a toggle: if the rail is already showing
    // the Jira thread, collapse it; otherwise open it on Jira.
    if (showAgents && selectedRailAgent?.id === 4) {
      setShowAgents(false)
      return
    }
    const jira = contacts.find((c) => c.id === 4)
    if (!jira) return
    setSelectedRailAgent(jira)
    setShowAgents(true)
  }

  const startJiraDemoFlow = (sentText) => {
    const parts = []
    let remaining = sentText
    const regex = /\/Jira/i
    let match
    while ((match = regex.exec(remaining)) !== null) {
      if (match.index > 0) parts.push(remaining.slice(0, match.index))
      parts.push({ type: 'mention', name: 'Jira' })
      remaining = remaining.slice(match.index + match[0].length)
    }
    if (remaining) parts.push(remaining)
    const messageText = parts.length > 1 || typeof parts[0] !== 'string' ? parts : sentText

    const userTime = nowTimeStr()
    const userMsgId = `thread-u-${Date.now()}`

    // The user's message is the anchor of a new thread in the main canvas.
    // It's flagged private so the bubble shows the "Only you can see this
    // conversation" disclaimer and the subtle gray border — both indicate
    // the thread is visible only to the user and the agent.
    setExtraMessages((prev) => ({
      ...prev,
      [activeChatId]: [
        ...(prev[activeChatId] || []),
        { id: userMsgId, senderId: 'me', text: messageText, time: userTime, isPrivate: true },
      ],
    }))
    setJiraThreadAnchorId(userMsgId)

    // Seed the rail thread so it shows the anchor at the top when it opens.
    setAgentChatMessages((prev) => ({
      ...prev,
      4: [{ id: userMsgId, from: 'me', text: messageText, time: userTime }],
    }))

    // Create the session so the thread is discoverable later from Jira's
    // sessions list.
    const jira = contacts.find((c) => c.id === 4)
    const now = new Date()
    const sessionId = `s4-group-${Date.now()}`
    const previewText = Array.isArray(messageText)
      ? messageText.map((p) => (typeof p === 'string' ? p : `/${p.name}`)).join('')
      : messageText
    const sessionName = previewText.replace(/^\/?jira\s*/i, '').trim().slice(0, 60) || 'Blocker discussion'
    addSession(4, {
      id: sessionId,
      name: sessionName,
      time: now.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      preview: previewText,
      sourceChatId: activeChatId,
    })
    setJiraGroupSessionId(sessionId)

    // Open the rail with Jira selected and start the reply.
    setSelectedRailAgent(jira)
    setShowAgents(true)
    scheduleJiraResponse(0, userMsgId)
  }

  const handleSend = () => {
    if (!composeMention && !inputValue.trim()) return

    const chatId = activeChatId
    const bucket = canvasKey
    const sentText = composeMention
      ? `/${composeMention}${inputValue ? ' ' + inputValue.trimStart() : ''}`
      : inputValue
    setInputValue('')
    setComposeMention(null)

    const isJiraInvocation = JIRA_FLOW_ENABLED && chatId === 11 && sentText.toLowerCase().includes('jira')
    if (isJiraInvocation) {
      startJiraDemoFlow(sentText)
      return
    }

    // Power BI link detection — when the compose draft contains the Power BI
    // URL, strip the URL from the display text and attach the full powerBILink
    // data so the unfurl flow kicks off immediately after send.
    const pbiUrlMatch = sentText.match(/(https?:\/\/powerbi\.com\/[^\s]+)/)
    const isPowerBILink = !!pbiUrlMatch && !composeAuthDismissed
    const messageText = isPowerBILink
      ? sentText.replace(pbiUrlMatch[0], '').replace(/:\s*$/, ':').trim()
      : sentText

    const myMessage = isPowerBILink
      ? {
          id: 'pbi-chat35',
          senderId: 'me',
          text: messageText || sentText,
          time: nowTimeStr(),
          powerBILink: { ...powerBILinkTemplate, url: pbiUrlMatch[0] },
        }
      : {
          id: `extra-${Date.now()}`,
          senderId: 'me',
          text: sentText,
          time: nowTimeStr(),
        }

    setComposeAuthDismissed(false)

    setExtraMessages((prev) => ({
      ...prev,
      [bucket]: [...(prev[bucket] || []), myMessage],
    }))
    finalizePendingSession(sentText)

    // Sarah Chen (id 1) scripted auto-response — exercises the typing
    // indicator flow end-to-end from a regular 1:1 chat.
    if (chatId === 1) {
      setMainTypingAgentId(chatId)
      setTimeout(() => {
        setMainTypingAgentId((prev) => (prev === chatId ? null : prev))
        setExtraMessages((prev) => ({
          ...prev,
          [bucket]: [...(prev[bucket] || []), {
            id: `sarah-reply-${Date.now()}`,
            senderId: 1,
            text: 'got it — taking a look now, will ping you in a bit',
            time: nowTimeStr(),
          }],
        }))
      }, 2000)
    }
  }

  const sendPromptSuggestion = (suggestion) => {
    const chatId = activeChatId
    const bucket = canvasKey
    const myMessage = {
      id: `extra-${Date.now()}`,
      senderId: 'me',
      text: suggestion.text,
      time: nowTimeStr(),
    }
    setExtraMessages((prev) => ({
      ...prev,
      [bucket]: [...(prev[bucket] || []), myMessage],
    }))
    finalizePendingSession(suggestion.text, suggestion.title)

    // Typing indicator then the prepared response.
    setMainTypingAgentId(chatId)
    const delay = 2000 + Math.floor(Math.random() * 1000)
    setTimeout(() => {
      setMainTypingAgentId((prev) => (prev === chatId ? null : prev))
      const agentMessage = {
        id: `extra-${Date.now()}-r`,
        senderId: chatId,
        text: suggestion.response,
        time: nowTimeStr(),
      }
      setExtraMessages((prev) => ({
        ...prev,
        [bucket]: [...(prev[bucket] || []), agentMessage],
      }))
    }, delay)
  }

  const agentSuggestions = isAgent ? promptSuggestions[activeChatId] : null
  const showPromptSuggestions = !!agentSuggestions && messages.length === 0 && mainTypingAgentId !== activeChatId

  // Option 1: Show arrows for relevant steps. Option 2: no chat arrow needed (lands directly in chat 35).
  const showChatArrow = authOption === 'option1' && ((demoStep === 1) || (demoStep === 4))
  const showSignInArrow = demoStep === 5 && authOption === 'option1'
  // Option 2: Show banner arrow when auth is pending and viewing chat 35
  const hasPendingAuth = Object.values(powerBIStates).some(state => state === 'auth-pending')
  const showBannerArrow = (authOption === 'option2' || authOption === 'option3') && hasPendingAuth && activeChatId === 35
  const arrowTarget = demoStep === 1 ? 'chat-34' : 'chat-35'

  return (
    <div className="chat-view">
      {showChatArrow && (
        <div className={`chat-demo-arrow chat-demo-arrow-${arrowTarget}`}>
          <DemoArrow direction="left" size={24} />
        </div>
      )}
      {showSignInArrow && (
        <div className="chat-demo-arrow chat-demo-arrow-signin">
          <DemoArrow direction="left" size={24} />
          <span className="chat-demo-tooltip">Click for SSO (silent auth).</span>
        </div>
      )}
      {showBannerArrow && (
        <div className="chat-demo-arrow chat-demo-arrow-banner">
          <span className="chat-demo-tooltip">
            Click the yellow banner to sign in Power BI.<br />
            The ephemeral banner is only visible for Alex in 24hr.
          </span>
          <DemoArrow direction="right" size={24} />
        </div>
      )}
      <div className="chat-view-main">
        <ChatHeader
          activeContact={activeContact}
          isChannel={isChannel}
          isGroup={isGroup}
          participantCount={participantCount}
          hasSessions={hasSessions}
          showSessions={showSessions}
          onToggleSessions={() => setShowSessions((prev) => !prev)}
          showThreads={threadRailOpen && channelThreadPostId === null}
          onToggleThreads={() => {
            if (threadRailOpen && channelThreadPostId === null) {
              setThreadRailOpen(false)
            } else {
              setChannelThreadPostId(null)
              setThreadRailOpen(true)
            }
          }}
        />

        <div className="chat-messages">
          {isChannel ? (
            <div className="messages-container messages-container-channel">
              {channelPosts.map((post) => (
                <MessageRow
                  key={post.id}
                  message={postToMessage(post)}
                  activeContact={activeContact}
                  onOpenThread={() => {
                    if (threadRailOpen && channelThreadPostId === post.id) {
                      setThreadRailOpen(false)
                      setChannelThreadPostId(null)
                    } else {
                      setChannelThreadPostId(post.id)
                      setThreadRailOpen(true)
                    }
                  }}
                  onPowerBISignIn={handlePowerBISignIn}
                  processingAuthKey={processingAuthKey}
                  authOption={authOption}
                  onBannerSignIn={handleBannerSignIn}
                  onBannerDismiss={handleBannerDismiss}
                  dismissedBanners={dismissedBanners}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : showPromptSuggestions ? (
            <PromptSuggestions
              agent={activeContact}
              suggestions={agentSuggestions}
              onSelectPrompt={sendPromptSuggestion}
            />
          ) : (
            <div className="messages-container">
              {sourceChat && (
                <div className="session-source-banner">
                  Started conversation from{' '}
                  <a
                    className="session-source-banner-link"
                    href="#"
                    onClick={(e) => { e.preventDefault(); onSelectChat(sourceChat.id) }}
                  >{sourceChat.name}</a>
                  <br />
                  Recent context from the conversation has been shared with this session.
                </div>
              )}
              {messages.map((msg) => {
                const isThreaded = isGroup && msg.replies?.length > 0
                // Add messageKey to powerBILink for non-channel messages
                const processedMsg = msg.powerBILink ? {
                  ...msg,
                  powerBILink: {
                    ...msg.powerBILink,
                    messageKey: `${activeChatId}-${msg.id}`,
                  },
                } : msg
                return (
                  <MessageRow
                    key={msg.id}
                    message={isThreaded ? postToMessage(processedMsg) : processedMsg}
                    activeContact={activeContact}
                    onOpenThread={isThreaded ? () => {
                      if (threadRailOpen && channelThreadPostId === msg.id) {
                        setThreadRailOpen(false)
                        setChannelThreadPostId(null)
                      } else {
                        setChannelThreadPostId(msg.id)
                        setThreadRailOpen(true)
                      }
                    } : openJiraThread}
                    onPowerBISignIn={handlePowerBISignIn}
                    processingAuthKey={processingAuthKey}
                    authOption={authOption}
                    onBannerSignIn={handleBannerSignIn}
                    onBannerDismiss={handleBannerDismiss}
                    dismissedBanners={dismissedBanners}
                  />
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="chat-compose-area">
          {mainTypingAgentId && (
            <TypingIndicator
              contact={mainTypingAgentId === activeChatId ? activeContact : contacts.find(c => c.id === mainTypingAgentId) || activeContact}
              className="chat-compose-typing"
            />
          )}
          <Compose
            value={inputValue}
            mention={composeMention}
            onChange={setInputValue}
            onClearMention={() => setComposeMention(null)}
            onSend={handleSend}
            isChannel={isChannel}
            freDismissed={freDismissed}
            onAuthDismiss={() => setComposeAuthDismissed(true)}
          />
        </div>
      </div>

      {showSessions && (
        <SessionsRail
          sessions={sessions[activeChatId] || []}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onClose={() => setShowSessions(false)}
          onNewSession={handleNewSession}
        />
      )}
      {showAgents && (
        <AgentsRail
          agents={agentsInConversation}
          recommended={recommendedAgents}
          selectedAgent={selectedRailAgent}
          onSelectAgent={selectRailAgent}
          messages={selectedRailAgent ? agentChatMessages[selectedRailAgent.id] || [] : []}
          onSendMessage={sendInRail}
          composeHint={railComposeHint}
          typingAgentId={railTypingAgentId}
          onClose={() => setShowAgents(false)}
        />
      )}
      {threadRailOpen && (
        <ChannelThreadRail
          posts={isChannel ? channelPosts : groupThreadablePosts}
          initialPostId={channelThreadPostId}
          activeContact={activeContact}
          onClose={() => {
            setThreadRailOpen(false)
            setChannelThreadPostId(null)
          }}
        />
      )}
    </div>
  )
}
