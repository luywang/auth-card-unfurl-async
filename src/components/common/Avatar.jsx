import { agentLogos } from '../../shared/agentLogos'
import './Avatar.css'

// Renders a contact/agent/group avatar. Status dot scales with `size` so it
// stays visually balanced across usages (title bar 28, message row 32, etc).
// Groups and agents typically have no `contact.status` — no dot is drawn.
export default function Avatar({ contact, size = 36, hideStatus = false }) {
  const logoSize = size * 0.4
  const insetLogoSize = Math.round(size * 0.6)
  const dotSize = Math.max(6, Math.round(size * 0.28))
  // Channels use rounded-square avatars; everything else stays circular.
  const radius = contact.isChannel ? Math.max(3, Math.round(size * 0.18)) : '50%'
  // `logoInset`: avatar image is a logo (not a photo) that has no built-in
  // padding. Render it smaller, centered, on the contact's background color
  // with a thin border so the avatar is visible against light surfaces.
  const inset = contact.logoInset
  return (
    <div
      className={`avatar ${contact.isChannel ? 'avatar-channel' : ''} ${inset ? 'avatar-inset' : ''}`.trim()}
      style={{
        width: size,
        height: size,
        background: contact.avatar && !inset ? 'transparent' : (contact.color || '#FFFFFF'),
        fontSize: size * 0.36,
        borderRadius: radius,
      }}
    >
      {contact.avatar ? (
        inset ? (
          <img
            src={contact.avatar}
            alt=""
            className="avatar-img-inset"
            style={{ width: insetLogoSize, height: insetLogoSize }}
          />
        ) : (
          <img
            src={contact.avatar}
            alt=""
            className="avatar-img"
            style={{ width: size, height: size, borderRadius: radius }}
          />
        )
      ) : contact.isAgent ? agentLogos[contact.logo](logoSize) : contact.initials}
      {contact.status && !hideStatus && (
        <span
          className={`status-dot status-${contact.status}`}
          style={{ width: dotSize, height: dotSize }}
        />
      )}
    </div>
  )
}
