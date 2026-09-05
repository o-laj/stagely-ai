import { STAGES, STALE_DAYS, daysSince } from './JobBoard.jsx'

const COLUMNS = '2.2fr 1.3fr 1fr 1.6fr 0.9fr 1fr 0.6fr'

export default function SheetView({ jobs, onStageChange, onDelete, onOpen }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.scrollArea}>
        <div style={{ ...styles.headerRow, gridTemplateColumns: COLUMNS }}>
          <span>Role</span>
          <span>Company</span>
          <span>Stage</span>
          <span>Next action</span>
          <span>Salary</span>
          <span>Links</span>
          <span></span>
        </div>

        <div style={styles.rows}>
          {jobs.map((job) => {
            const isStale = job.stage === 'Applied' && daysSince(job.lastUpdated) >= STALE_DAYS
            const days = job.lastUpdated
              ? Math.floor((Date.now() - job.lastUpdated) / (1000 * 60 * 60 * 24))
              : 0

            return (
              <div
                key={job.id}
                style={{
                  ...styles.row,
                  gridTemplateColumns: COLUMNS,
                  borderLeftColor: `var(--stage-${job.stage.toLowerCase()})`,
                }}
              >
                <div style={styles.roleCell} onClick={() => onOpen(job)}>
                  <span style={styles.roleTitle}>{job.title || 'Untitled role'}</span>
                  <span style={styles.daysTag}>
                    {days === 0 ? 'today' : `${days}d ago`}
                    {isStale && <span style={styles.staleMark}> · stale</span>}
                  </span>
                </div>

                <div style={styles.cell} onClick={() => onOpen(job)}>
                  {job.company || '—'}
                </div>

               <div style={styles.cell}>
                  <select
                    style={{
                      ...styles.stagePill,
                      color: `var(--stage-${job.stage.toLowerCase()})`,
                      borderColor: `var(--stage-${job.stage.toLowerCase()})`,
                      outline: 'none',
                    }}
                    value={job.stage}
                    onChange={(e) => onStageChange(job.id, e.target.value)}
                  >
                    {STAGES.map((s) => (
                      <option
                        key={s}
                        value={s}
                        style={{
                          backgroundColor: '#000',
                          color: '#fff',
                        }}
                      >
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.cell} onClick={() => onOpen(job)}>
                  <span style={styles.nextActionText}>{job.nextAction || '—'}</span>
                </div>

                <div style={{ ...styles.cell, ...styles.mono }} onClick={() => onOpen(job)}>
                  {job.salary || '—'}
                </div>

                <div style={styles.linksCell}>
                  {job.link && (
                    <a href={job.link} target="_blank" rel="noreferrer" style={styles.linkIcon}>
                      Post
                    </a>
                  )}
                  {job.website && (
                    <a href={job.website} target="_blank" rel="noreferrer" style={styles.linkIcon}>
                      Site
                    </a>
                  )}
                  {job.referenceLink && (
                    <a
                      href={job.referenceLink}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.linkIcon}
                    >
                      Ref
                    </a>
                  )}
                </div>

                <div style={styles.actionsCell}>
                  <button style={styles.deleteBtn} onClick={() => onDelete(job.id)} title="Remove">
                    ×
                  </button>
                </div>
              </div>
            )
          })}

          {jobs.length === 0 && <div style={styles.empty}>No jobs added yet.</div>}
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 6,
  },
  scrollArea: {
    overflowX: 'auto',
  },
  headerRow: {
    display: 'grid',
    gap: 12,
    padding: '10px 16px',
    minWidth: 760,
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  row: {
    display: 'grid',
    gap: 12,
    alignItems: 'center',
    minWidth: 760,
    background: 'var(--surface-raised)',
    borderRadius: 8,
    borderLeft: '3px solid',
    padding: '11px 16px',
    transition: 'background 0.12s ease',
  },
  roleCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    cursor: 'pointer',
    minWidth: 0,
  },
  roleTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: 13.5,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  daysTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10.5,
    color: 'var(--text-muted)',
  },
  staleMark: {
    color: 'var(--accent)',
  },
  cell: {
    fontSize: 13,
    color: 'var(--text)',
    cursor: 'pointer',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  mono: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--stage-offer)',
  },
  nextActionText: {
    color: 'var(--text-muted)',
  },
  
  stagePill: {
    background: 'transparent',
    border: '1px solid',
    borderRadius: 20,
    padding: '4px 10px',
    fontSize: 12,
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    outline: 'none',
    cursor: 'pointer',
    boxShadow: 'none',
  },
  linksCell: {
    display: 'flex',
    gap: 10,
  },
  linkIcon: {
    fontSize: 12,
    color: 'var(--stage-applied)',
    textDecoration: 'none',
  },
  actionsCell: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 18,
    lineHeight: 1,
    cursor: 'pointer',
    padding: '0 4px',
  },
  empty: {
    color: 'var(--text-muted)',
    fontSize: 13,
    textAlign: 'center',
    padding: '40px 16px',
  },
}
