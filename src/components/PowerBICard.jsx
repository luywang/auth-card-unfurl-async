// Power BI link unfurl cards: thumbnail (fallback) and rich preview (final state).
// Used in the async unfurl flow described in the functional spec.

import './PowerBICard.css'

// Power BI brand color for chart elements
const PBI_YELLOW = '#F2C811'
const PBI_BLUE = '#118DFF'
const PBI_GREEN = '#00C000'

// Thumbnail card - initial fallback state shown before auth completes
export function PowerBIThumbnail({ report }) {
  return (
    <div className="powerbi-thumbnail">
      <div className="powerbi-thumbnail-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill={PBI_YELLOW}>
          <rect x="3" y="9" width="4" height="12" rx="0.5"/>
          <rect x="10" y="5" width="4" height="16" rx="0.5"/>
          <rect x="17" y="2" width="4" height="19" rx="0.5"/>
        </svg>
      </div>
      <div className="powerbi-thumbnail-text">
        <div className="powerbi-thumbnail-title">{report.title}</div>
        <div className="powerbi-thumbnail-subtitle">Power BI Report</div>
      </div>
    </div>
  )
}

// Rich card - final unfurl state after auth completes
export function PowerBICard({ report }) {
  return (
    <div className="powerbi-card">
      {/* Header with Power BI logo + report title */}
      <div className="powerbi-card-header">
        <div className="powerbi-card-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill={PBI_YELLOW}>
            <rect x="3" y="9" width="4" height="12" rx="0.5"/>
            <rect x="10" y="5" width="4" height="16" rx="0.5"/>
            <rect x="17" y="2" width="4" height="19" rx="0.5"/>
          </svg>
        </div>
        <div className="powerbi-card-title">{report.title}</div>
      </div>

      {/* Visualization preview - simplified bar chart */}
      <div className="powerbi-card-viz">
        <div className="powerbi-card-chart">
          {report.chartData.map((item, i) => (
            <div key={i} className="powerbi-chart-bar">
              <div className="powerbi-chart-label">{item.label}</div>
              <div className="powerbi-chart-track">
                <div
                  className="powerbi-chart-fill"
                  style={{
                    width: `${item.value}%`,
                    background: item.color || PBI_BLUE
                  }}
                />
              </div>
              <div className="powerbi-chart-value">{item.displayValue}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics row */}
      <div className="powerbi-card-metrics">
        {report.metrics.map((metric, i) => (
          <div key={i} className="powerbi-metric">
            <div className="powerbi-metric-label">{metric.label}</div>
            <div className="powerbi-metric-value">{metric.value}</div>
            {metric.delta && (
              <div className={`powerbi-metric-delta powerbi-metric-delta-${metric.deltaDirection}`}>
                {metric.deltaDirection === 'up' ? '↑' : '↓'} {metric.delta}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer - workspace path */}
      <div className="powerbi-card-footer">
        {report.workspace} · Last refreshed {report.lastRefreshed}
      </div>

      {/* Action button */}
      <div className="powerbi-card-actions">
        <button className="powerbi-card-action-btn">Open in Power BI</button>
      </div>
    </div>
  )
}
