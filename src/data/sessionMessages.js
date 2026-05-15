// Messages for each agent session — keyed by session ID
// s2-1 and s4-1 map to the default messagesByContact[2] and [4] respectively
export const sessionMessages = {
  // ── Claude sessions ──
  's2-2': [
    { id: 1, senderId: 'me', text: 'I need to design a resilient error handling strategy for our microservices. What patterns should I consider?', time: '3:45 PM' },
    { id: 2, senderId: 2, text: 'For microservices, I\'d recommend layering a few complementary patterns:\n\n1. Retry with exponential backoff — for transient failures (network blips, 503s)\n2. Circuit breaker — prevent cascading failures when a downstream service is unhealthy\n3. Bulkhead isolation — limit concurrency per dependency so one slow service doesn\'t exhaust your thread pool\n4. Dead letter queues — for async operations that fail after all retries', time: '3:46 PM' },
    { id: 3, senderId: 'me', text: 'We\'re seeing a lot of timeout issues with the notification delivery service. The retry storms are making it worse.', time: '3:50 PM' },
    { id: 4, senderId: 2, text: 'That\'s a classic retry storm scenario. Here\'s what I\'d suggest:\n\nAdd jitter to your retry delays — instead of fixed exponential backoff (1s, 2s, 4s), add a random component (1s ± 500ms, 2s ± 1s, etc.). This decorrelates retry spikes across instances.\n\nAlso, implement a circuit breaker with a half-open state: after tripping, allow a single probe request through every 30 seconds. If it succeeds, close the circuit. If not, stay open.', time: '3:51 PM' },
    { id: 5, senderId: 'me', text: 'Good call on the jitter. What about idempotency? Some of our handlers aren\'t safe to retry.', time: '3:55 PM' },
    { id: 6, senderId: 2, text: 'Critical point. For non-idempotent operations, you have a few options:\n\n• Idempotency keys — the caller generates a unique key per request; the server deduplicates on that key within a TTL window\n• Outbox pattern — write the event to a local "outbox" table in the same DB transaction as the business logic, then publish from the outbox asynchronously\n\nThe outbox pattern is particularly useful for your notification service since it guarantees exactly-once processing without requiring the downstream to be idempotent.', time: '3:56 PM' },
  ],
  's2-3': [
    { id: 1, senderId: 'me', text: 'We need to migrate from Postgres 14 to 16. Can you help me think through the plan?', time: '11:20 AM' },
    { id: 2, senderId: 2, text: 'Sure! Here are the key considerations for a Postgres 14 → 16 migration:\n\n1. Check extension compatibility (especially pg_stat_statements, PostGIS if used)\n2. Run pg_upgrade in --check mode first to validate\n3. Plan for logical replication if you need zero-downtime\n4. Test query performance — PG16 has improved query planning that can change execution plans', time: '11:21 AM' },
    { id: 3, senderId: 'me', text: 'We\'re using pgvector and pg_cron. Any known issues?', time: '11:25 AM' },
    { id: 4, senderId: 2, text: 'pgvector should be fine — just make sure you rebuild the extension after the upgrade. pg_cron needs a version bump to match PG16. I\'d recommend:\n\n1. Upgrade read replicas first\n2. Run your test suite against the upgraded replica\n3. Perform a dry run of pg_upgrade on a staging clone\n4. Schedule the primary cutover during your lowest-traffic window\n\nFor rollback, keep the old data directory intact for 48 hours post-migration.', time: '11:26 AM' },
  ],
  's2-4': [
    { id: 1, senderId: 'me', text: 'The settings page component is 1200 lines. I want to break it up but I\'m not sure where to start.', time: '2:00 PM' },
    { id: 2, senderId: 2, text: 'Let\'s think about this systematically. What are the main sections of the settings page?', time: '2:01 PM' },
    { id: 3, senderId: 'me', text: 'Profile settings, notification preferences, security (2FA, sessions), connected apps, and a danger zone (delete account).', time: '2:03 PM' },
    { id: 4, senderId: 2, text: 'Natural component boundaries right there. I\'d suggest:\n\n• SettingsPage — thin shell with tab navigation, handles routing between sections\n• ProfileSection — avatar upload, display name, email\n• NotificationPreferences — the channel × category matrix\n• SecuritySection — 2FA toggle, active sessions list, password change\n• ConnectedApps — OAuth integrations list with revoke buttons\n• DangerZone — account deletion with confirmation flow\n\nEach section owns its own form state and API calls. The parent just handles tab switching.', time: '2:04 PM' },
    { id: 5, senderId: 'me', text: 'Should I use a shared form library or keep each section independent?', time: '2:10 PM' },
    { id: 6, senderId: 2, text: 'Keep them independent. Shared form state across sections creates coupling — if someone edits their profile and then switches to notifications, you\'d need to handle unsaved changes warnings cross-section. Each section having its own save button and state is simpler and matches user expectations.', time: '2:11 PM' },
  ],
  's2-5': [
    { id: 1, senderId: 'me', text: 'Help me draft release notes for v2.4. The big features are agent handoff and plugin sandboxing.', time: '10:30 AM' },
    { id: 2, senderId: 2, text: 'Here\'s a draft:\n\n**v2.4 Release Notes**\n\n🔄 Agent Handoff\nAgents can now seamlessly transfer conversations to other agents while preserving full context. Users see a smooth transition with no repeated information.\n\n🔒 Plugin Sandboxing\nThird-party plugins now run in isolated environments with scoped file system and network access. This improves security without impacting developer experience.\n\nWant me to add a "Bug Fixes" or "Breaking Changes" section?', time: '10:32 AM' },
    { id: 3, senderId: 'me', text: 'Yes, add bug fixes. We fixed the webhook retry storm issue and the flaky integration tests.', time: '10:35 AM' },
    { id: 4, senderId: 2, text: 'Updated:\n\n**Bug Fixes**\n• Fixed retry storm in webhook delivery by adding jitter to exponential backoff\n• Resolved intermittent integration test failures caused by race conditions in the event bus mock\n• Fixed session token refresh during agent handoff that caused brief session drops\n\nShould I also add any deprecation notices or migration notes?', time: '10:36 AM' },
  ],
  's2-6': [
    { id: 1, senderId: 'me', text: 'I need help writing the copy for our new user onboarding wizard. There are 4 steps: welcome, workspace setup, invite teammates, and explore features.', time: '4:15 PM' },
    { id: 2, senderId: 2, text: 'Here\'s a draft for each step:\n\n**Step 1 — Welcome**\n"Welcome to the team! Let\'s get your workspace set up in under 2 minutes."\n\n**Step 2 — Workspace Setup**\n"Name your workspace and pick a theme. You can always change these later in Settings."\n\n**Step 3 — Invite Teammates**\n"Work is better together. Add teammates by email or share an invite link."\n\n**Step 4 — Explore Features**\n"You\'re all set! Here are a few things to try first."', time: '4:17 PM' },
    { id: 3, senderId: 'me', text: 'Can you make the tone a bit more professional? This is an enterprise product.', time: '4:20 PM' },
    { id: 4, senderId: 2, text: 'Good point. Here\'s the revised version:\n\n**Step 1 — Welcome**\n"Welcome. Let\'s configure your workspace — this should take about 2 minutes."\n\n**Step 2 — Workspace Setup**\n"Set your workspace name and appearance. These can be updated anytime in Settings."\n\n**Step 3 — Invite Teammates**\n"Add team members by email address or generate a shareable invite link."\n\n**Step 4 — Explore Features**\n"Your workspace is ready. Here are some key features to get started with."', time: '4:21 PM' },
  ],
  's2-7': [
    { id: 1, senderId: 'me', text: 'I need to write a test strategy for the webhook delivery system. What should I cover?', time: '9:00 AM' },
    { id: 2, senderId: 2, text: 'For a webhook delivery system, I\'d organize tests into three tiers:\n\n**Unit tests** — test the retry logic, backoff calculations, payload serialization, and signature generation in isolation.\n\n**Integration tests** — spin up a real HTTP server as the webhook target. Test successful delivery, 4xx/5xx responses, timeouts, and TLS certificate validation.\n\n**End-to-end tests** — simulate the full flow from event trigger to webhook delivery to dead letter queue. Verify the entire pipeline works with realistic latency and failure scenarios.', time: '9:02 AM' },
    { id: 3, senderId: 'me', text: 'How should we handle the flaky network scenarios in CI?', time: '9:08 AM' },
    { id: 4, senderId: 2, text: 'Use a chaos proxy like toxiproxy between your test harness and the mock webhook endpoint. You can programmatically inject:\n\n• Latency (slow responses)\n• Connection resets (mid-transfer failures)\n• Bandwidth limits (timeouts on large payloads)\n\nThis gives you deterministic failure injection without actual flakiness. Run these as a separate test suite that doesn\'t block CI by default — trigger them on PRs that touch the delivery pipeline.', time: '9:09 AM' },
  ],
  's2-8': [
    { id: 1, senderId: 'me', text: 'I\'m writing an ADR for adopting event sourcing in our notification service. Can you help me structure it?', time: '1:30 PM' },
    { id: 2, senderId: 2, text: 'Sure. Here\'s a standard ADR structure adapted for this decision:\n\n**Title:** Adopt Event Sourcing for Notification Service\n\n**Status:** Proposed\n\n**Context:** The current state-based model makes it hard to audit notification delivery history, debug failed deliveries, and replay events after outages.\n\n**Decision:** Use event sourcing for the notification pipeline. Store immutable events (NotificationRequested, DeliveryAttempted, DeliverySucceeded, DeliveryFailed) and derive current state from the event log.\n\n**Consequences:**\n• Pro: Full audit trail, easy replay, natural fit for async pipelines\n• Con: Higher storage cost, eventual consistency, steeper learning curve\n\nWant me to expand any section?', time: '1:32 PM' },
    { id: 3, senderId: 'me', text: 'Expand on the "Alternatives Considered" section. We also looked at CDC with Debezium and a simple audit log table.', time: '1:38 PM' },
    { id: 4, senderId: 2, text: '**Alternatives Considered:**\n\n1. **CDC with Debezium** — captures row-level changes from Postgres WAL. Lower implementation effort but couples us to the DB schema. Schema changes require careful migration of CDC consumers. Also doesn\'t capture intent — only "what changed," not "why."\n\n2. **Audit log table** — append-only table with before/after snapshots. Simpler than event sourcing but lacks the ability to rebuild state from events. Also grows large quickly without the benefits of event replay.\n\nEvent sourcing was chosen because the notification pipeline is naturally event-driven and we need both auditability and replay capability for incident recovery.', time: '1:40 PM' },
  ],
  // ── Jira sessions ──
  's4-2': [
    { id: 1, senderId: 'me', text: 'Show me all blockers for the April 25 milestone', time: '11:00 AM' },
    { id: 2, senderId: 4, text: 'Found 2 open blockers for the April 25 milestone:\n\n• JIRA-4555 — Auth token refresh during agent handoff (High, assigned to Kevin Park)\n• JIRA-4562 — Plugin sandbox file system isolation (High, assigned to Alex Morgan)\n\nBoth are In Progress. Would you like more details on either?', time: '11:00 AM' },
    { id: 3, senderId: 'me', text: 'What\'s the status on JIRA-4555? Any recent updates?', time: '11:05 AM' },
    {
      id: 4,
      senderId: 4,
      text: 'JIRA-4555 — Last updated 2 hours ago by Kevin Park:\n\n"Found the root cause. The refresh token is being invalidated during the handoff context switch. Working on a fix that preserves the token across agent boundaries. ETA: end of day tomorrow."\n\nThere are 5 comments and 1 linked PR (draft).',
      link: {
        source: 'jira',
        title: 'JIRA-4555 — Auth token refresh during agent handoff',
        subtitle: 'In Progress · Kevin Park · High priority',
        url: 'https://jira.example.com/browse/JIRA-4555',
      },
      time: '11:05 AM',
    },
  ],
  's4-3': [
    {
      id: 1,
      senderId: 4,
      text: 'JIRA-4521 has been assigned to you: "Implement notification preference API endpoints"',
      link: {
        source: 'jira',
        title: 'JIRA-4521 — Implement notification preference API endpoints',
        subtitle: 'To Do · assigned to you · Sprint 14',
        url: 'https://jira.example.com/browse/JIRA-4521',
      },
      time: '2:15 PM',
    },
    { id: 2, senderId: 'me', text: 'What\'s the full description and acceptance criteria?', time: '2:18 PM' },
    { id: 3, senderId: 4, text: 'JIRA-4521 — Implement notification preference API endpoints\n\nDescription: Build REST endpoints for managing user notification preferences across push, email, and in-app channels.\n\nAcceptance Criteria:\n• GET /preferences returns the full preference matrix\n• PUT /preferences updates individual channel × category toggles\n• POST /preferences/reset restores defaults\n• All endpoints require authentication\n• Changes emit a PreferenceUpdated event', time: '2:18 PM' },
    { id: 4, senderId: 'me', text: 'Who are the linked issues?', time: '2:22 PM' },
    { id: 5, senderId: 4, text: 'JIRA-4521 has 2 linked issues:\n\n• Blocks: JIRA-4530 — "Build notification preferences UI" (assigned to Sarah Chen, Not Started)\n• Related to: JIRA-4498 — "Fix rate limiting on webhook delivery" (assigned to you, In Progress)', time: '2:22 PM' },
  ],
  's4-4': [
    { id: 1, senderId: 'me', text: 'Give me a Sprint 13 retrospective summary', time: '5:00 PM' },
    { id: 2, senderId: 4, text: 'Sprint 13 Summary:\n\n• Velocity: 34 story points (target was 38)\n• Completed: 12 of 15 tickets\n• Carried over: 3 tickets (JIRA-4480, JIRA-4492, JIRA-4501)\n\nBy team member:\n• Alex Morgan: 10 pts completed, 0 carried over\n• Kevin Park: 8 pts completed, 1 carried over\n• Sarah Chen: 8 pts completed, 1 carried over\n• Olivia Martinez: 8 pts completed, 1 carried over', time: '5:01 PM' },
    { id: 3, senderId: 'me', text: 'What were the carryover tickets about?', time: '5:05 PM' },
    { id: 4, senderId: 4, text: '• JIRA-4480 — "Implement rate limiting dashboard" (Kevin, 5 pts) — blocked by backend API dependency\n• JIRA-4492 — "Accessibility audit for settings page" (Sarah, 3 pts) — needed additional screen reader testing\n• JIRA-4501 — "Webhook retry metrics" (Olivia, 3 pts) — deprioritized mid-sprint for a production incident', time: '5:06 PM' },
  ],
  's4-5': [
    { id: 1, senderId: 'me', text: 'Show me all P1 bugs in the webhook delivery module', time: '3:20 PM' },
    { id: 2, senderId: 4, text: 'Found 3 open P1 bugs in the webhook delivery module:\n\n• JIRA-4570 — "Webhooks silently failing for payloads over 1MB" (Unassigned)\n• JIRA-4573 — "Retry count not resetting after successful delivery" (Assigned to Olivia Martinez)\n• JIRA-4578 — "TLS handshake timeout not respecting configured value" (Assigned to you)', time: '3:20 PM' },
    { id: 3, senderId: 'me', text: 'Assign JIRA-4570 to me', time: '3:25 PM' },
    {
      id: 4,
      senderId: 4,
      text: 'Done. JIRA-4570 has been assigned to Alex Morgan. I\'ve also updated the status to In Progress. You now have 5 open tickets in Sprint 14.',
      link: {
        source: 'jira',
        title: 'JIRA-4570 — Webhooks silently failing for payloads over 1MB',
        subtitle: 'In Progress · assigned to you · P1',
        url: 'https://jira.example.com/browse/JIRA-4570',
      },
      time: '3:25 PM',
    },
  ],
  's4-6': [
    { id: 1, senderId: 'me', text: 'Are we ready to ship v2.3? Show me the release checklist status.', time: '10:00 AM' },
    { id: 2, senderId: 4, text: 'v2.3 Release Readiness:\n\n✅ All feature tickets: Done (8/8)\n✅ Bug fixes: Done (5/5)\n✅ QA sign-off: Approved\n⚠️ Documentation: 2 of 3 articles updated\n✅ Staging deployment: Verified\n✅ Load test: Passed (p99 < 200ms)\n\nOne documentation ticket is still In Review: JIRA-4510 — "Update API migration guide for v2.3"', time: '10:01 AM' },
    { id: 3, senderId: 'me', text: 'Who\'s working on that doc ticket?', time: '10:05 AM' },
    {
      id: 4,
      senderId: 4,
      text: 'JIRA-4510 is assigned to David Nguyen. Last updated 3 hours ago with comment: "PR is up, waiting for tech writer review." The PR has 1 approval, needs 1 more.',
      link: {
        source: 'jira',
        title: 'JIRA-4510 — Update API migration guide for v2.3',
        subtitle: 'In Review · David Nguyen · 1/2 approvals',
        url: 'https://jira.example.com/browse/JIRA-4510',
      },
      time: '10:05 AM',
    },
  ],
  's4-7': [
    { id: 1, senderId: 'me', text: 'What tickets are blocked by the auth token refresh work?', time: '2:45 PM' },
    { id: 2, senderId: 4, text: 'Found 4 tickets blocked by JIRA-4555 (Auth token refresh during agent handoff):\n\n• JIRA-4560 — "End-to-end agent handoff testing" (QA, assigned to Rachel Thompson)\n• JIRA-4563 — "Agent handoff analytics events" (Dev, assigned to James Kim)\n• JIRA-4567 — "Handoff UX polish and loading states" (Design, assigned to Sarah Chen)\n• JIRA-4571 — "Agent handoff documentation" (Docs, assigned to David Nguyen)', time: '2:46 PM' },
    { id: 3, senderId: 'me', text: 'When is the ETA for the auth fix?', time: '2:50 PM' },
    {
      id: 4,
      senderId: 4,
      text: 'Based on Kevin Park\'s latest update on JIRA-4555: "ETA is end of day April 18." If that holds, the blocked tickets can resume on April 19, giving 6 working days before the April 25 milestone.',
      link: {
        source: 'jira',
        title: 'JIRA-4555 — Auth token refresh during agent handoff',
        subtitle: 'In Progress · Kevin Park · ETA April 18',
        url: 'https://jira.example.com/browse/JIRA-4555',
      },
      time: '2:50 PM',
    },
  ],

  // ── Figma sessions ──
  's31-2': [
    { id: 1, senderId: 'me', text: 'Export the variant C empty state at 2x for the launch blog.', time: '2:36 PM' },
    { id: 2, senderId: 31, text: 'Exporting Variant C / Empty State from the Northwind launch file at 2x…', time: '2:36 PM' },
    {
      id: 3,
      senderId: 31,
      text: 'Done — variant-c-empty-state@2x.png (1840×1240). Dropped in /assets/blog/ in the shared launch folder.',
      link: {
        source: 'figma',
        title: 'Northwind launch / Variant C — Empty state',
        subtitle: 'figma.com · source frame',
        url: 'https://figma.com/file/nw-launch/variant-c-empty-state',
      },
      time: '2:38 PM',
    },
    { id: 4, senderId: 'me', text: 'Also export the dark variant.', time: '2:40 PM' },
    { id: 5, senderId: 31, text: 'No "dark" variant of empty state in the file — only Variant A, B, and C. Dark mode treatment hasn\'t been published yet. Should I flag Sarah?', time: '2:40 PM' },
    { id: 6, senderId: 'me', text: 'No, leave it. Will check with her directly.', time: '2:42 PM' },
  ],
  's31-3': [
    { id: 1, senderId: 'me', text: 'What\'s the latest version of the prompt-suggestion card component?', time: '10:13 AM' },
    {
      id: 2,
      senderId: 31,
      text: 'Component: Card / Prompt Suggestion — v2.4 (published 4/21 by Sarah Chen).\n\nv2.4 changelog:\n• 8px corner radius (was 4px)\n• Hover lift reduced 4px → 2px\n• Title size 15 → 14\n\nUsed in 3 files, 18 instances.',
      link: {
        source: 'figma',
        title: 'Northwind UI Library / Card / Prompt Suggestion',
        subtitle: 'figma.com · v2.4 · published 4/21',
        url: 'https://figma.com/file/nw-ui-lib/card-prompt-suggestion',
      },
      time: '10:13 AM',
    },
    { id: 3, senderId: 'me', text: 'Any instances still on v2.3?', time: '10:15 AM' },
    { id: 4, senderId: 31, text: '2 instances still on v2.3:\n\n• Northwind / Onboarding — Step 1 (1 instance)\n• Morgan Collective / Internal — Brief Template (1 instance)\n\nBoth can swap to v2.4 with no breaking changes. Update them?', time: '10:15 AM' },
    { id: 5, senderId: 'me', text: 'Yes for the Northwind one. Leave the Morgan internal file for me to handle.', time: '10:18 AM' },
    { id: 6, senderId: 31, text: 'Updated the Northwind onboarding instance to v2.4. Left the Morgan Collective file untouched.', time: '10:18 AM', reactions: [{ emoji: '✅', count: 1 }] },
  ],
  's31-4': [
    { id: 1, senderId: 'me', text: 'Audit detached component instances across the Northwind launch file.', time: '11:18 AM' },
    {
      id: 2,
      senderId: 31,
      text: '3 detached component instances:\n\n• Button / Primary — partner onboarding step 2\n• Toast / Info — session expired flow\n• Avatar / 32 — agents rail header\n\nWant me to flag them for Sarah?',
      link: {
        source: 'figma',
        title: 'Northwind launch — file',
        subtitle: 'figma.com · 3 detached instances',
        url: 'https://figma.com/file/nw-launch',
      },
      time: '11:18 AM',
    },
    { id: 3, senderId: 'me', text: 'Yes — comment on each with @Sarah and a one-line note.', time: '11:20 AM' },
    { id: 4, senderId: 31, text: 'Done. 3 comments left on the file, all assigned to Sarah Chen.', time: '11:20 AM', reactions: [{ emoji: '👍', count: 1 }] },
  ],
  's31-5': [
    { id: 1, senderId: 'me', text: 'Which frames in the Northwind file are still on the deprecated tokens?', time: '3:00 PM' },
    { id: 2, senderId: 31, text: '2 frames still reference deprecated tokens:\n\n• Settings / Notification preferences — uses color/legacy/surface-2\n• Onboarding / Step 4 — uses spacing/legacy/md\n\nBoth have one-token migrations available. Apply automatically?', time: '3:00 PM' },
    { id: 3, senderId: 'me', text: 'Apply both and leave a comment so Sarah sees it next time she\'s in the file.', time: '3:03 PM' },
    {
      id: 4,
      senderId: 31,
      text: 'Migrations applied to both frames. Comment left on each tagging Sarah Chen with the diff.',
      link: {
        source: 'figma',
        title: 'Northwind launch — file (2 frames updated)',
        subtitle: 'figma.com · updated just now',
        url: 'https://figma.com/file/nw-launch',
      },
      time: '3:03 PM',
      reactions: [{ emoji: '✅', count: 1 }],
    },
  ],
  's31-6': [
    { id: 1, senderId: 'me', text: 'Compare the v2.3 and v2.4 component library — list breaking renames.', time: '9:30 AM' },
    {
      id: 2,
      senderId: 31,
      text: 'v2.3 → v2.4 diff:\n\nBreaking renames (3):\n• Button / Primary → Button / Filled (style API parity)\n• Card / Suggestion → Card / Prompt Suggestion (clarifies usage)\n• Toast / Error → Toast / Critical (severity scale rename)\n\nNon-breaking: 12 published edits, 0 removed components.',
      link: {
        source: 'figma',
        title: 'Northwind UI Library — Component sheet',
        subtitle: 'figma.com · v2.4 · published 4/21',
        url: 'https://figma.com/file/nw-ui-lib',
      },
      time: '9:30 AM',
    },
    { id: 3, senderId: 'me', text: 'For the renames — how many places need to be updated?', time: '9:34 AM' },
    { id: 4, senderId: 31, text: 'Across all your files:\n\n• Button / Primary → Filled — 47 instances in 6 files\n• Card / Suggestion → Card / Prompt Suggestion — 18 instances in 3 files\n• Toast / Error → Toast / Critical — 9 instances in 2 files\n\nMost are auto-migratable (style props are 1:1). The Toast rename has a severity-color shift that warrants a manual look.', time: '9:34 AM' },
    { id: 5, senderId: 'me', text: 'Auto-migrate the buttons and cards. Leave the toasts for me.', time: '9:38 AM' },
    { id: 6, senderId: 31, text: 'Auto-migrated — 47 buttons + 18 cards updated across 9 files. Toasts left for manual review with a tracking comment on each frame.', time: '9:39 AM', reactions: [{ emoji: '🎯', count: 1 }] },
  ],

  // ── Cowork sessions ──
  // Each session showcases the canonical Cowork loop: request → plan →
  // approval → background execution → checkpoint → delivered artifacts.
  's32-2': [
    { id: 1, senderId: 'me', text: 'Audit my calendar for tomorrow. Decline anything I\'m not the decision-maker on; protect 2–4 PM as deep work.', time: '7:50 AM' },
    {
      id: 2,
      senderId: 32,
      text: 'Calendar audit plan — review for approval before I apply changes.',
      cards: [
        {
          accentColor: '#5B5FC7',
          iconType: 'teams',
          title: 'Tuesday calendar audit',
          subtitle: '11 meetings · 8h 15m booked · 1 conflict found.',
          badge: { text: 'Awaiting approval', tone: 'amber' },
          sections: [
            {
              heading: 'Will reschedule (1)',
              bullets: ['Eng/Design sync — overlaps Northwind launch sync; propose Wed 10 AM'],
            },
            {
              heading: 'Will decline (2)',
              bullets: [
                'Brand refresh kickoff — FYI only; "follow up async" note',
                'Tooling guild monthly — you\'re not on the agenda',
              ],
            },
            {
              heading: 'Will protect',
              bullets: ['2:00–4:00 PM — focus block, notifications muted'],
            },
          ],
          footer: 'No changes applied until you approve',
          actions: ['Approve & apply', 'Edit'],
        },
      ],
      time: '7:50 AM',
    },
    { id: 3, senderId: 'me', text: 'Approved.', time: '7:52 AM' },
    { id: 4, senderId: 32, text: 'Running. 12 changes to process — I\'ll DM when done.', time: '7:52 AM' },
    {
      id: 5,
      senderId: 32,
      text: 'Calendar audit complete:\n\n• Conflict resolved — Eng/Design sync moved to Wed 10 AM (all 4 attendees accepted)\n• 2 declines sent with "follow up async" notes\n• 2:00–4:00 PM blocked as Focus Time, notifications muted\n• Pre-meeting briefs queued for the 3 remaining 1:1s\n\nNet recovered time: 1h 45m.',
      chainOfThought: [
        'Reviewed Tuesday\'s 11 meetings against your decision-maker rules',
        'Identified 1 conflict (Eng/Design sync overlapping Northwind launch sync)',
        'Flagged 2 low-priority candidates (Brand refresh kickoff, Tooling guild monthly)',
        'Rescheduled Eng/Design sync to Wed 10 AM and re-invited 4 attendees',
        'Sent 2 polite "follow up async" decline notes',
        'Applied 2:00–4:00 PM focus block and muted notifications for that window',
        'Queued pre-meeting briefs for your 3 remaining 1:1s',
      ],
      time: '7:58 AM',
      reactions: [{ emoji: '🎯', count: 1 }],
    },
  ],
  's32-3': [
    { id: 1, senderId: 'me', text: 'Compile a research brief on agent handoff success benchmarks across the industry. Internal + public sources, with citations.', time: '11:30 AM' },
    {
      id: 2,
      senderId: 32,
      text: 'Plan ready. "Research" run, not "publish-ready" — confirm before I execute.',
      cards: [
        {
          accentColor: '#5B5FC7',
          iconType: 'teams',
          title: 'Handoff success benchmarks',
          subtitle: 'Cited research — internal + public sources, packaged in Word.',
          badge: { text: 'Awaiting approval', tone: 'amber' },
          sections: [
            {
              heading: 'Internal sources',
              bullets: [
                'James\'s Sprint 14 staging numbers',
                'CA working-group thread',
                'Partner readout prep brief',
              ],
            },
            {
              heading: 'External sources',
              bullets: [
                'Vendor X benchmark (Q1 2026)',
                'Vendor Y whitepaper',
                '2 Forrester analyst notes',
                '1 Gartner mention',
              ],
            },
            {
              heading: 'Output',
              text: 'One-page Word summary with inline citations + 5-row comparison table.',
            },
          ],
          footer: 'Estimated runtime ~2 min',
          actions: ['Approve & run', 'Edit'],
        },
      ],
      time: '11:30 AM',
    },
    { id: 3, senderId: 'me', text: 'Run it.', time: '11:31 AM' },
    {
      id: 4,
      senderId: 32,
      text: 'Done. One-page summary + 5-row table, 8 citations. Headline: Northwind staging at 95.3% sits at the top of the public band.',
      cards: [
        {
          type: 'file',
          fileType: 'word',
          name: 'Handoff benchmarks — Research summary',
          subtitle: 'Visible only to you',
        },
      ],
      chainOfThought: [
        'Pulled internal staging numbers from James\'s Sprint 14 report',
        'Read the CA working-group thread for context',
        'Searched the Vendor X benchmark (Q1 2026)',
        'Read the Vendor Y whitepaper',
        'Reviewed 2 Forrester analyst notes and 1 Gartner mention',
        'Compiled a 5-row comparison table',
        'Drafted a one-page Word summary with 8 inline citations',
      ],
      time: '11:33 AM',
    },
    { id: 5, senderId: 'me', text: 'Add the table to my Conversational AI prep deck slide 4.', time: '11:35 AM' },
    {
      id: 6,
      senderId: 32,
      text: 'Added — table inserted on slide 4 (Benchmarks) with citations linked.',
      cards: [
        {
          type: 'file',
          fileType: 'powerpoint',
          name: 'CA prep — April 24',
          subtitle: 'Visible to people in your organization',
        },
      ],
      time: '11:36 AM',
      reactions: [{ emoji: '🎯', count: 1 }],
    },
  ],
  's32-4': [
    { id: 1, senderId: 'me', text: 'Build a launch plan for the cross-tenant v3 capability — competitive analysis, value prop, milestone outline with owners.', time: '3:00 PM' },
    {
      id: 2,
      senderId: 32,
      text: '4-deliverable plan. Larger run — confirms scope before I start.',
      cards: [
        {
          accentColor: '#5B5FC7',
          iconType: 'teams',
          title: 'Cross-tenant v3 launch package',
          subtitle: 'Cross-app run — Excel, Word, PowerPoint.',
          badge: { text: 'Awaiting approval', tone: 'amber' },
          steps: [
            { text: 'Competitive analysis (Excel) — 4 vendors × 6 dimensions, sourced from public materials + analyst notes', status: 'pending' },
            { text: 'Value prop one-pager (Word) — for partner-facing leadership', status: 'pending' },
            { text: 'Pitch deck skeleton (PowerPoint) — 8-slide outline, you fill in the narrative', status: 'pending' },
            { text: 'Milestone outline (Word) — phases with proposed owners pulled from your collaborator graph', status: 'pending' },
          ],
          footer: 'Estimated runtime ~6 min · runs in the background',
          actions: ['Approve & run', 'Edit scope'],
        },
      ],
      time: '3:00 PM',
    },
    { id: 3, senderId: 'me', text: 'Approved. For owners — propose, don\'t assign. I\'ll confirm.', time: '3:02 PM' },
    { id: 4, senderId: 32, text: 'Got it. Owners will be flagged "proposed" in the milestone doc with rationale.', time: '3:02 PM' },
    { id: 5, senderId: 32, text: 'Checkpoint — Vendor Y\'s public materials are sparse. Substitute Vendor Z (more comparable feature set) or note Y as "limited public data"?', time: '3:08 PM' },
    { id: 6, senderId: 'me', text: 'Substitute Vendor Z. Note the swap in a footnote.', time: '3:09 PM' },
    {
      id: 7,
      senderId: 32,
      text: 'Run complete. 4 artifacts ready — competitive analysis, value prop, pitch deck (8-slide skeleton), and milestones doc (owners flagged "proposed" for your confirmation).',
      cards: [
        {
          type: 'file',
          fileType: 'excel',
          name: 'Cross-tenant v3 — Competitive analysis',
          subtitle: 'Visible only to you',
        },
        {
          type: 'file',
          fileType: 'word',
          name: 'Cross-tenant v3 — Value prop',
          subtitle: 'Visible only to you',
        },
        {
          type: 'file',
          fileType: 'powerpoint',
          name: 'Cross-tenant v3 — Pitch',
          subtitle: 'Visible only to you',
        },
        {
          type: 'file',
          fileType: 'word',
          name: 'Cross-tenant v3 — Milestones',
          subtitle: 'Visible only to you',
        },
      ],
      chainOfThought: [
        'Researched 4 vendors (X, Z, Q, R) — substituted Vendor Z for Y per your decision',
        'Read Vendor X, Z, Q, R public materials and 2 analyst notes',
        'Built a 6-dimension comparison in Excel (depth, breadth, security, ops, pricing, partner motion)',
        'Drafted a value-prop one-pager in Word for partner-facing leadership',
        'Generated an 8-slide PowerPoint skeleton with section headings',
        'Pulled milestone phases from your cross-tenant PRD draft',
        'Proposed owners from your collaborator graph and flagged each as "proposed"',
      ],
      time: '3:15 PM',
      reactions: [{ emoji: '🚀', count: 1 }],
    },
  ],
  's32-5': [
    { id: 1, senderId: 'me', text: 'Prep me for my Rachel 1:1 today at 2 PM.', time: '11:30 AM' },
    {
      id: 2,
      senderId: 32,
      text: 'Plan — quick prep run, ~90 seconds.',
      cards: [
        {
          accentColor: '#5B5FC7',
          iconType: 'teams',
          title: 'Rachel 1:1 prep',
          subtitle: 'Aggregating context from the last 14 days.',
          badge: { text: 'Awaiting approval', tone: 'amber' },
          sections: [
            {
              heading: 'Sources',
              bullets: [
                '1:1 chat history',
                'Northwind launch channel',
                'Shared docs you both touched',
                'Calendar overlaps',
              ],
            },
            {
              heading: 'Output',
              text: '5 talking points + open questions Rachel raised but didn\'t resolve + recap of last 1:1 commitments.',
            },
          ],
          footer: '~90 sec runtime',
          actions: ['Approve & run'],
        },
      ],
      time: '11:30 AM',
    },
    { id: 3, senderId: 'me', text: 'Approved.', time: '11:31 AM' },
    {
      id: 4,
      senderId: 32,
      text: 'Done — your prep doc is ready 5 minutes before the meeting. 5 talking points (incl. Northwind readiness, cross-tenant scope, retro logistics, Q3 renewal, CA cadence), 3 open questions Rachel raised but didn\'t resolve, and a recap of last 1:1 commitments.',
      cards: [
        {
          type: 'file',
          fileType: 'word',
          name: 'Rachel 1:1 prep — April 24',
          subtitle: 'Visible only to you',
        },
      ],
      chainOfThought: [
        'Pulled 14 days of Rachel 1:1 chat history',
        'Scanned Northwind launch channel for cross-references',
        'Compared shared docs you both touched in the last 14 days',
        'Identified 5 talking points based on recent activity',
        'Surfaced 3 open questions Rachel raised but didn\'t resolve',
        'Recapped commitments from your last 1:1 (4/15) — both completed',
        'Saved prep doc to Word, scheduled to surface 5 min before the meeting',
      ],
      time: '11:40 AM',
      reactions: [{ emoji: '🧠', count: 1 }],
    },
  ],
  's32-6': [
    { id: 1, senderId: 'me', text: 'Build me a 30-day reflection on focus time honored vs. booked. Drop it in my Reflect-on-Friday template.', time: '4:30 PM' },
    {
      id: 2,
      senderId: 32,
      text: 'Reflection plan — runs against your last 30 days of calendar + Teams activity.',
      cards: [
        {
          accentColor: '#5B5FC7',
          iconType: 'teams',
          title: '30-day focus-time reflection',
          subtitle: 'Aggregate analysis — no individual meeting names in output.',
          badge: { text: 'Awaiting approval', tone: 'amber' },
          sections: [
            {
              heading: 'Sources',
              bullets: [
                'Outlook calendar — focus blocks scheduled vs. honored',
                'Teams status history — DND/quiet hours respected',
                'Meeting overrides — count and pattern',
              ],
            },
            {
              heading: 'Output',
              text: 'Filled section in your Reflect-on-Friday Word doc: focus hours honored, top breakers, weekday pattern, week-over-week trend.',
            },
          ],
          footer: 'Privacy: aggregate only',
          actions: ['Approve & run', 'Edit scope'],
        },
      ],
      time: '4:30 PM',
    },
    { id: 3, senderId: 'me', text: 'Approved.', time: '4:31 PM' },
    { id: 4, senderId: 32, text: 'Running in the background. Will land in your Reflect doc — I\'ll DM you when done so you can read it Friday morning.', time: '4:31 PM', reactions: [{ emoji: '🪞', count: 1 }] },
  ],
  's32-7': [
    { id: 1, senderId: 'me', text: 'Set up a daily 7 AM digest of what\'s moving on the Northwind launch — channels, partner email threads, and pending decisions.', time: '7:00 AM' },
    {
      id: 2,
      senderId: 32,
      text: 'Recurring plan — runs every weekday, takes ~30s, lands as a DM.',
      cards: [
        {
          accentColor: '#5B5FC7',
          iconType: 'teams',
          title: 'Northwind launch daily digest',
          subtitle: 'Weekday 7 AM digest grouped by theme.',
          badge: { text: 'Awaiting approval', tone: 'amber' },
          facts: [
            { label: 'Cadence', value: 'Weekdays at 7:00 AM PT' },
            { label: 'Sources', value: 'Northwind launch channel · 3 partner email threads · readiness tracker' },
            { label: 'Stop condition', value: 'Pause anytime; auto-pauses after 3 quiet weekdays' },
          ],
          footer: '~30 sec per run · runs in the background',
          actions: ['Approve & schedule', 'Run once'],
        },
      ],
      time: '7:00 AM',
    },
    { id: 3, senderId: 'me', text: 'Schedule it.', time: '7:02 AM' },
    { id: 4, senderId: 32, text: 'Scheduled. First digest fires tomorrow 7:00 AM PT.', time: '7:02 AM' },
    {
      id: 5,
      senderId: 32,
      text: 'Today\'s digest:',
      cards: [
        {
          accentColor: '#5B5FC7',
          title: 'Northwind launch — daily digest',
          subtitle: 'Tue April 22 · 24-hour rollup',
          badge: { text: 'Daily', tone: 'purple' },
          sections: [
            {
              heading: 'Decisions pending',
              bullets: ['Cross-tenant scope (partner-asked) — Rachel owns, no movement in 24h'],
            },
            {
              heading: 'Risks',
              bullets: ['JIRA-4593 still in review — Kevin targeting EOD'],
            },
            {
              heading: 'Wins',
              bullets: [
                'Auth PR merged, staging clean for 14h',
                'Sarah\'s variant C empty state landed final',
              ],
            },
            {
              heading: 'Blockers',
              bullets: ['None active'],
            },
            {
              heading: 'FYI',
              bullets: [
                'David\'s migration guide hits draft-2 today',
                'Emma starts PTO Friday',
              ],
            },
          ],
          footer: 'Generated by Cowork · Tue 7:00 AM · pause anytime',
          actions: ['Snooze 1 day', 'Pause'],
        },
      ],
      chainOfThought: [
        'Scanned Northwind launch channel for last 24h activity (37 messages)',
        'Pulled 3 partner email threads with new replies',
        'Checked the readiness tracker for status changes',
        'Cross-referenced JIRA for ticket movement (4 changes)',
        'Grouped findings by theme — decisions, risks, wins, blockers, FYI',
        'Composed the 5-section digest',
      ],
      time: 'Tue 7:00 AM',
    },
  ],
  's32-8': [
    { id: 1, senderId: 'me', text: 'Build a competitive snapshot for Vendor Y. Want it for tomorrow\'s strategy review.', time: '2:00 PM' },
    {
      id: 2,
      senderId: 32,
      text: 'Plan — single-vendor deep dive.',
      cards: [
        {
          accentColor: '#5B5FC7',
          iconType: 'teams',
          title: 'Vendor Y competitive snapshot',
          subtitle: 'Excel deliverable — 5 dimensions, methodology gaps flagged inline.',
          badge: { text: 'Awaiting approval', tone: 'amber' },
          sections: [
            {
              heading: 'Sources',
              bullets: [
                'Vendor Y public docs',
                '2 analyst notes',
                'Partner-recorded demo',
                'Their last 3 release blogs',
              ],
            },
            {
              heading: 'Output',
              text: '5-dimension Excel: capability depth · security · ops model · pricing · partner motion. Methodology gaps flagged in cell comments.',
            },
          ],
          actions: ['Approve & run'],
        },
      ],
      time: '2:00 PM',
    },
    { id: 3, senderId: 'me', text: 'Approved.', time: '2:01 PM' },
    { id: 4, senderId: 32, text: 'Checkpoint — Vendor Y\'s public benchmark methodology counts user-cancelled handoffs as failures (we don\'t). Note this in the snapshot, or normalize their numbers to our methodology?', time: 'Apr 18 2:08 PM' },
    { id: 5, senderId: 'me', text: 'Note it. Don\'t normalize — partners read these and we shouldn\'t adjust their published numbers.', time: 'Apr 18 2:10 PM' },
    {
      id: 6,
      senderId: 32,
      text: 'Done. 5-dimension comparison, 6 cited sources, 2 methodology gaps flagged inline (handoff counting, retention denominator).',
      cards: [
        {
          type: 'file',
          fileType: 'excel',
          name: 'Vendor Y — Competitive snapshot',
          subtitle: 'Visible only to you',
        },
      ],
      chainOfThought: [
        'Pulled Vendor Y public docs and last 3 release blogs',
        'Read 2 analyst notes covering Vendor Y',
        'Watched the partner-recorded Vendor Y demo',
        'Identified 2 methodology gaps (handoff counting, retention denominator)',
        'Flagged gaps as cell comments per your decision (no normalization)',
        'Compiled 5-dimension Excel comparison with 6 cited sources',
      ],
      time: 'Apr 18 2:20 PM',
      reactions: [{ emoji: '🎯', count: 1 }],
    },
  ],
}
