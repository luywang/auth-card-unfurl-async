import { useState } from 'react'
import { CheckCircle, ChevronRight } from './Icon'
import './ChainOfThought.css'

// Post-reasoning trace shown at the bottom of an agent's result message.
// Mirrors the "Chain of Thought" / "Show steps" pattern surfaced in Teams,
// Claude, and ChatGPT — a collapsed summary row that expands to reveal the
// discrete steps the agent took to complete a task.
//
// Reusable across agents. Attach to a message via `message.chainOfThought:
// string[]`; MessageRow renders this component at the very bottom of the
// bubble. The box adopts the bubble's background (transparent) so it works
// equally well in mine vs. theirs bubbles.
export default function ChainOfThought({ steps, label = 'Completed steps' }) {
  const [expanded, setExpanded] = useState(false)
  if (!steps || steps.length === 0) return null
  return (
    <div className={`chain-of-thought${expanded ? ' chain-of-thought-expanded' : ''}`}>
      <button
        type="button"
        className="cot-toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={expanded ? `Hide steps for "${label}"` : `Show steps for "${label}"`}
      >
        <CheckCircle size={16} stroke="#707070" />
        <span className="cot-label">{label}</span>
        <ChevronRight size={14} />
      </button>
      {expanded && (
        <ul className="cot-steps" role="list">
          {steps.map((step, i) => (
            <li key={i} className="cot-step">
              <CheckCircle size={14} stroke="#707070" />
              <span className="cot-step-text">{typeof step === 'string' ? step : step.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
