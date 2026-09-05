import { STAGES, STALE_DAYS, daysSince } from './JobBoard.jsx'
import JobCard from './JobCard.jsx'

export default function BoardView({ jobs, onStageChange, onDelete, onOpen }) {
  return (
    <div style={styles.board}>
      {STAGES.map((stage) => {
        const stageJobs = jobs.filter((j) => j.stage === stage)
        return (
          <div key={stage} style={styles.column}>
            <div style={styles.columnHeader}>
              <span
                style={{
                  ...styles.stageDot,
                  background: `var(--stage-${stage.toLowerCase()})`,
                }}
              />
              <span style={styles.columnTitle}>{stage}</span>
              <span style={styles.columnCount}>{stageJobs.length}</span>
            </div>
            <div style={styles.columnBody}>
              {stageJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  stages={STAGES}
                  isStale={job.stage === 'Applied' && daysSince(job.lastUpdated) >= STALE_DAYS}
                  onStageChange={(newStage) => onStageChange(job.id, newStage)}
                  onDelete={() => onDelete(job.id)}
                  onOpen={() => onOpen(job)}
                />
              ))}
              {stageJobs.length === 0 && <div style={styles.emptyCol}>Nothing here yet</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const styles = {
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 14,
    alignItems: 'start',
  },
  column: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    minHeight: 160,
    display: 'flex',
    flexDirection: 'column',
  },
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 14px',
    borderBottom: '1px solid var(--border)',
  },
  stageDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  columnTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: 13.5,
    flex: 1,
  },
  columnCount: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  columnBody: {
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    flex: 1,
  },
  emptyCol: {
    color: 'var(--text-muted)',
    fontSize: 12.5,
    textAlign: 'center',
    padding: '20px 8px',
  },
}
