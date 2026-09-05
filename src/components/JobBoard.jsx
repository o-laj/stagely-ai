import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import AddJobModal from './AddJobModal.jsx'
import JobEditModal from './JobEditModal.jsx'
import BoardView from './BoardView.jsx'
import SheetView from './SheetView.jsx'

export const STAGES = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted']
export const STALE_DAYS = 7
const VIEW_KEY = 'stagely-view'

// Pulls the first number out of a free-text salary string (e.g. "$120,000 - $150,000"
// -> 120000) so it can be sorted. Jobs with no parseable number sort to the bottom.
function parseSalary(salary) {
  if (!salary) return null
  const match = salary.replace(/,/g, '').match(/\d+(\.\d+)?/)
  return match ? parseFloat(match[0]) : null
}

export default function JobBoard({ user }) {
  const [jobs, setJobs] = useState([])
  const [addOpen, setAddOpen] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [view, setView] = useState(() => localStorage.getItem(VIEW_KEY) || 'sheet')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('dateAdded') // 'dateAdded' | 'salary'
  const [sortDir, setSortDir] = useState('desc') // 'asc' | 'desc'
  const [stageFilter, setStageFilter] = useState([]) // empty = all stages

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view)
  }, [view])

  useEffect(() => {
    const q = query(
      collection(db, 'users', user.uid, 'jobs'),
      orderBy('lastUpdated', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [user.uid])

  const staleJobs = jobs.filter(
    (j) => j.stage === 'Applied' && daysSince(j.lastUpdated) >= STALE_DAYS
  )

  const visibleJobs = useMemo(() => {
    const q = search.trim().toLowerCase()
    let result = jobs
    if (q) {
      result = result.filter(
        (j) =>
          (j.title || '').toLowerCase().includes(q) ||
          (j.company || '').toLowerCase().includes(q)
      )
    }
    if (stageFilter.length > 0) {
      result = result.filter((j) => stageFilter.includes(j.stage))
    }

    const dir = sortDir === 'asc' ? 1 : -1
    result = [...result].sort((a, b) => {
      if (sortBy === 'salary') {
        const sa = parseSalary(a.salary)
        const sb = parseSalary(b.salary)
        if (sa === null && sb === null) return 0
        if (sa === null) return 1 // no-salary jobs always sort last
        if (sb === null) return -1
        return (sa - sb) * dir
      }
      // dateAdded
      const da = a.createdAt || 0
      const db_ = b.createdAt || 0
      return (da - db_) * dir
    })

    return result
  }, [jobs, search, sortBy, sortDir, stageFilter])

  function toggleStage(stage) {
    setStageFilter((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    )
  }

  async function updateStage(jobId, stage) {
    await updateDoc(doc(db, 'users', user.uid, 'jobs', jobId), {
      stage,
      lastUpdated: Date.now(),
    })
  }

  async function updateJob(jobId, fields) {
    await updateDoc(doc(db, 'users', user.uid, 'jobs', jobId), {
      ...fields,
      lastUpdated: Date.now(),
    })
  }

  async function removeJob(jobId) {
    await deleteDoc(doc(db, 'users', user.uid, 'jobs', jobId))
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.toolbar}>
        {staleJobs.length > 0 ? (
          <div style={styles.staleBanner}>
            <span style={styles.staleDot} />
            {staleJobs.length} application{staleJobs.length > 1 ? 's have' : ' has'} sat in{' '}
            <b>Applied</b> for {STALE_DAYS}+ days — still waiting, or time to update?
          </div>
        ) : (
          <div />
        )}
        <div style={styles.toolbarRight}>
          <div style={styles.viewToggle}>
            <button
              style={{ ...styles.viewBtn, ...(view === 'sheet' ? styles.viewBtnActive : {}) }}
              onClick={() => setView('sheet')}
            >
              Sheet
            </button>
            <button
              style={{ ...styles.viewBtn, ...(view === 'board' ? styles.viewBtnActive : {}) }}
              onClick={() => setView('board')}
            >
              Board
            </button>
          </div>
          <button style={styles.addBtn} onClick={() => setAddOpen(true)}>
            + Add a job
          </button>
        </div>
      </div>

      <div style={styles.filterRow}>
        <input
          style={styles.searchInput}
          placeholder="Search role or company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={styles.sortGroup}>
          <select
            style={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="dateAdded">Date added</option>
            <option value="salary">Salary</option>
          </select>
          <button
            style={styles.sortDirBtn}
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      <div style={styles.stageRow}>
        {STAGES.map((s) => {
          const active = stageFilter.includes(s)
          return (
            <button
              key={s}
              onClick={() => toggleStage(s)}
              style={{
                ...styles.stageChip,
                borderColor: `var(--stage-${s.toLowerCase()})`,
                color: active ? '#10121a' : `var(--stage-${s.toLowerCase()})`,
                background: active ? `var(--stage-${s.toLowerCase()})` : 'transparent',
              }}
            >
              {s}
            </button>
          )
        })}
        {stageFilter.length > 0 && (
          <button style={styles.clearStagesBtn} onClick={() => setStageFilter([])}>
            Clear
          </button>
        )}
      </div>

      {view === 'board' ? (
        <BoardView
          jobs={visibleJobs}
          onStageChange={updateStage}
          onDelete={removeJob}
          onOpen={setEditingJob}
        />
      ) : (
        <SheetView
          jobs={visibleJobs}
          onStageChange={updateStage}
          onDelete={removeJob}
          onOpen={setEditingJob}
        />
      )}

      {addOpen && <AddJobModal user={user} onClose={() => setAddOpen(false)} />}
      {editingJob && (
        <JobEditModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSave={(fields) => {
            updateJob(editingJob.id, fields)
            setEditingJob(null)
          }}
          onDelete={() => {
            removeJob(editingJob.id)
            setEditingJob(null)
          }}
        />
      )}
    </div>
  )
}

export function daysSince(timestamp) {
  if (!timestamp) return 0
  return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24))
}

const styles = {
  wrap: { padding: '20px 24px 40px' },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  staleBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13.5,
    color: 'var(--text-muted)',
  },
  staleDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--stage-rejected)',
    flexShrink: 0,
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginLeft: 'auto',
  },
  viewToggle: {
    display: 'flex',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  viewBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    borderRadius: 6,
    padding: '6px 14px',
    fontSize: 13,
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    cursor: 'pointer',
  },
  viewBtnActive: {
    background: 'var(--accent)',
    color: '#10121a',
  },
  addBtn: {
    background: 'var(--accent)',
    color: '#10121a',
    border: 'none',
    borderRadius: 8,
    padding: '10px 18px',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: '1 1 240px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 8,
    padding: '9px 12px',
    fontSize: 13.5,
  },
  sortGroup: {
    display: 'flex',
    gap: 8,
  },
  sortSelect: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 8,
    padding: '9px 10px',
    fontSize: 13,
  },
  sortDirBtn: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 8,
    padding: '9px 14px',
    fontSize: 13,
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  stageRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  stageChip: {
    border: '1px solid',
    borderRadius: 20,
    padding: '5px 13px',
    fontSize: 12.5,
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.12s ease, color 0.12s ease',
  },
  clearStagesBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 12.5,
    cursor: 'pointer',
    padding: '5px 6px',
    textDecoration: 'underline',
  },
}