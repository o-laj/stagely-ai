import { useState } from 'react'
import { STAGES } from './JobBoard.jsx'

export default function JobEditModal({ job, onClose, onSave, onDelete }) {
  const [fields, setFields] = useState({
    title: job.title || '',
    company: job.company || '',
    stage: job.stage || 'Applied',
    salary: job.salary || '',
    nextAction: job.nextAction || '',
    website: job.website || '',
    contact: job.contact || '',
    link: job.link || '',
    referenceLink: job.referenceLink || '',
    description: job.description || '',
  })

  function set(key, value) {
    setFields((f) => ({ ...f, [key]: value }))
  }

  function handleSave() {
    onSave({
      ...fields,
      salary: fields.salary || null,
      nextAction: fields.nextAction || null,
      website: fields.website || null,
      contact: fields.contact || null,
      link: fields.link || null,
      referenceLink: fields.referenceLink || null,
      description: fields.description || null,
    })
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Edit job</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.grid}>
          <div style={styles.field}>
            <label style={styles.label}>Job title</label>
            <input style={styles.input} value={fields.title} onChange={(e) => set('title', e.target.value)} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Company</label>
            <input style={styles.input} value={fields.company} onChange={(e) => set('company', e.target.value)} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Stage</label>
            <select style={styles.input} value={fields.stage} onChange={(e) => set('stage', e.target.value)}>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Salary</label>
            <input style={styles.input} value={fields.salary} onChange={(e) => set('salary', e.target.value)} />
          </div>

          <div style={{ ...styles.field, ...styles.fullWidth }}>
            <label style={styles.label}>Next action</label>
            <input
              style={styles.input}
              placeholder="e.g. Follow up Friday, prep for interview…"
              value={fields.nextAction}
              onChange={(e) => set('nextAction', e.target.value)}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contact</label>
            <input
              style={styles.input}
              placeholder="Name, email, or phone"
              value={fields.contact}
              onChange={(e) => set('contact', e.target.value)}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Company website</label>
            <input style={styles.input} value={fields.website} onChange={(e) => set('website', e.target.value)} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Job posting link</label>
            <input style={styles.input} value={fields.link} onChange={(e) => set('link', e.target.value)} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Reference link</label>
            <input
              style={styles.input}
              placeholder="Referral, notes doc, etc."
              value={fields.referenceLink}
              onChange={(e) => set('referenceLink', e.target.value)}
            />
          </div>

          <div style={{ ...styles.field, ...styles.fullWidth }}>
            <label style={styles.label}>Notes / description</label>
            <textarea
              style={styles.textarea}
              rows={3}
              value={fields.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>
        </div>

        <div style={styles.actions}>
          <button style={styles.dangerBtn} onClick={onDelete}>
            Delete job
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={styles.ghostBtn} onClick={onClose}>
              Cancel
            </button>
            <button style={styles.primaryBtn} onClick={handleSave}>
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(10, 11, 16, 0.72)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 50,
  },
  modal: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 22,
    width: '100%',
    maxWidth: 620,
    maxHeight: '85vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    margin: 0,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 22,
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14,
    marginBottom: 20,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  label: {
    fontSize: 11.5,
    color: 'var(--text-muted)',
    marginBottom: 5,
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  input: {
    background: 'var(--surface-raised)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    padding: '9px 10px',
    fontSize: 13.5,
  },
  textarea: {
    background: 'var(--surface-raised)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    padding: '9px 10px',
    fontSize: 13.5,
    fontFamily: 'var(--font-body)',
    resize: 'vertical',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  ghostBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-muted)',
    borderRadius: 8,
    padding: '9px 16px',
    fontSize: 13.5,
    cursor: 'pointer',
  },
  dangerBtn: {
    background: 'transparent',
    border: '1px solid var(--stage-rejected)',
    color: 'var(--stage-rejected)',
    borderRadius: 8,
    padding: '9px 16px',
    fontSize: 13.5,
    cursor: 'pointer',
  },
  primaryBtn: {
    background: 'var(--accent)',
    color: '#10121a',
    border: 'none',
    borderRadius: 8,
    padding: '9px 18px',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: 13.5,
    cursor: 'pointer',
  },
}
