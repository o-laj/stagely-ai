export default function JobCard({ job, stages, isStale, onStageChange, onDelete, onOpen }) {
  const days = job.lastUpdated
    ? Math.floor((Date.now() - job.lastUpdated) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div style={styles.card}>
      <div style={styles.cardTop} onClick={onOpen} role="button" tabIndex={0}>
        <h3 style={styles.title}>{job.title || 'Untitled role'}</h3>
        <button
          style={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          title="Remove"
        >
          ×
        </button>
      </div>
      <p style={styles.company} onClick={onOpen}>
        {job.company || 'Unknown company'}
      </p>
      {job.salary && <p style={styles.salary}>{job.salary}</p>}

      {job.nextAction && (
        <p style={styles.nextAction}>
          <span style={styles.nextActionLabel}>Next:</span> {job.nextAction}
        </p>
      )}

      <div style={styles.metaRow}>
        <span style={styles.daysLabel}>{days === 0 ? 'today' : `${days}d ago`}</span>
        {isStale && (
          <svg width="40" height="8" viewBox="0 0 40 8" style={styles.squiggle}>
            <path
              d="M1 5 Q 6 1, 11 5 T 21 5 T 31 5 T 39 5"
              stroke="var(--accent)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {(job.link || job.website || job.referenceLink) && (
        <div style={styles.linkRow}>
          {job.link && (
            <a href={job.link} target="_blank" rel="noreferrer" style={styles.link}>
              Posting ↗
            </a>
          )}
          {job.website && (
            <a href={job.website} target="_blank" rel="noreferrer" style={styles.link}>
              Site ↗
            </a>
          )}
          {job.referenceLink && (
            <a href={job.referenceLink} target="_blank" rel="noreferrer" style={styles.link}>
              Ref ↗
            </a>
          )}
        </div>
      )}

      <select
        style={styles.stageSelect}
        value={job.stage}
        onChange={(e) => onStageChange(e.target.value)}
      >
        {stages.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--surface-raised)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: 12,
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
    cursor: 'pointer',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 14,
    fontWeight: 600,
    margin: '0 0 2px',
    lineHeight: 1.3,
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 18,
    lineHeight: 1,
    cursor: 'pointer',
    padding: 0,
  },
  company: {
    color: 'var(--text-muted)',
    fontSize: 12.5,
    margin: '0 0 4px',
    cursor: 'pointer',
  },
  salary: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--stage-offer)',
    margin: '0 0 6px',
  },
  nextAction: {
    fontSize: 12,
    color: 'var(--text)',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    padding: '5px 8px',
    margin: '0 0 8px',
    lineHeight: 1.4,
  },
  nextActionLabel: {
    color: 'var(--accent)',
    fontFamily: 'var(--font-mono)',
    fontWeight: 500,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  daysLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-muted)',
  },
  squiggle: {
    flexShrink: 0,
  },
  linkRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 8,
  },
  link: {
    fontSize: 12,
    color: 'var(--stage-applied)',
    textDecoration: 'none',
  },
  stageSelect: {
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 6,
    padding: '6px 8px',
    fontSize: 12.5,
  },
}
