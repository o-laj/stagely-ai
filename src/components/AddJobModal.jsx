import { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { db, extractJobDetails } from '../firebase'

export default function AddJobModal({ user, onClose }) {
  const [rawText, setRawText] = useState('')
  const [link, setLink] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')
  const [fields, setFields] = useState(null) // { title, company, salary, summary }
  const [moreOpen, setMoreOpen] = useState(false)
  const [more, setMore] = useState({ nextAction: '', website: '', contact: '', referenceLink: '' })
  const [saving, setSaving] = useState(false)

  async function handleExtract() {
    if (!rawText.trim() && !link.trim()) return
    setExtracting(true)
    setError('')
    try {
      const res = await extractJobDetails({ text: rawText, link })
      setFields({
        title: res.data.title || '',
        company: res.data.company || '',
        salary: res.data.salary || '',
        summary: res.data.summary || '',
      })
      const extractedMore = {
        nextAction: '',
        website: res.data.website || '',
        contact: res.data.contact || '',
        referenceLink: res.data.referenceLink || '',
      }
      setMore(extractedMore)
      // Auto-open the extra-details section if Gemini actually found something,
      // so the user sees what got filled instead of it being hidden.
      if (extractedMore.website || extractedMore.contact || extractedMore.referenceLink) {
        setMoreOpen(true)
      }
    } catch (err) {
      console.error(err)
      setError("Couldn't extract details — you can still fill this in manually below.")
      setFields({ title: '', company: '', salary: '', summary: '' })
    } finally {
      setExtracting(false)
    }
  }

  function skipToManual() {
    setFields({ title: '', company: '', salary: '', summary: '' })
  }

  async function handleSave() {
    if (!fields.title || !fields.company) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'users', user.uid, 'jobs'), {
        title: fields.title,
        company: fields.company,
        salary: fields.salary || null,
        description: fields.summary || rawText || null,
        link: link || null,
        nextAction: more.nextAction || null,
        website: more.website || null,
        contact: more.contact || null,
        referenceLink: more.referenceLink || null,
        stage: 'Applied',
        lastUpdated: Date.now(),
        createdAt: Date.now(),
      })
      onClose()
    } catch (err) {
      console.error(err)
      setError('Could not save — check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Add a job</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        {!fields ? (
          <>
            <p style={styles.hint}>
              Paste the job description, paste a link to the posting, or both. The title, company, salary and website/contact/reference link will be pulled if they're there.
            </p>
            <textarea
              style={styles.textarea}
              placeholder="Paste the full job posting text here (optional if you have a link)…"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={8}
              autoFocus
            />
            <input
              style={styles.input}
              placeholder="Job posting link (optional if you pasted text)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            {error && <p style={styles.error}>{error}</p>}
            <div style={styles.actions}>
              <button style={styles.ghostBtn} onClick={skipToManual}>
                Skip, enter manually
              </button>
              <button
                style={styles.primaryBtn}
                onClick={handleExtract}
                disabled={extracting || (!rawText.trim() && !link.trim())}
              >
                {extracting ? 'Extracting…' : 'Extract details'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={styles.hint}>Check these over, then save.</p>
            <label style={styles.label}>Job title</label>
            <input
              style={styles.input}
              value={fields.title}
              onChange={(e) => setFields({ ...fields, title: e.target.value })}
            />
            <label style={styles.label}>Company</label>
            <input
              style={styles.input}
              value={fields.company}
              onChange={(e) => setFields({ ...fields, company: e.target.value })}
            />
            <label style={styles.label}>Salary (optional)</label>
            <input
              style={styles.input}
              value={fields.salary}
              onChange={(e) => setFields({ ...fields, salary: e.target.value })}
            />

            <button style={styles.moreToggle} onClick={() => setMoreOpen(!moreOpen)} type="button">
              {moreOpen ? '– Hide extra details' : '+ Add next action, contact, links…'}
            </button>

            {moreOpen && (
              <div style={styles.moreGrid}>
                <input
                  style={styles.input}
                  placeholder="Next action (e.g. follow up Friday)"
                  value={more.nextAction}
                  onChange={(e) => setMore({ ...more, nextAction: e.target.value })}
                />
                <input
                  style={styles.input}
                  placeholder="Contact (name/email)"
                  value={more.contact}
                  onChange={(e) => setMore({ ...more, contact: e.target.value })}
                />
                <input
                  style={styles.input}
                  placeholder="Company website"
                  value={more.website}
                  onChange={(e) => setMore({ ...more, website: e.target.value })}
                />
                <input
                  style={styles.input}
                  placeholder="Reference link"
                  value={more.referenceLink}
                  onChange={(e) => setMore({ ...more, referenceLink: e.target.value })}
                />
              </div>
            )}

            {error && <p style={styles.error}>{error}</p>}
            <div style={styles.actions}>
              <button style={styles.ghostBtn} onClick={() => setFields(null)}>
                Back
              </button>
              <button
                style={styles.primaryBtn}
                onClick={handleSave}
                disabled={saving || !fields.title || !fields.company}
              >
                {saving ? 'Saving…' : 'Save job'}
              </button>
            </div>
          </>
        )}
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
    maxWidth: 460,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  hint: {
    color: 'var(--text-muted)',
    fontSize: 13,
    lineHeight: 1.5,
    marginBottom: 14,
  },
  textarea: {
    width: '100%',
    background: 'var(--surface-raised)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    padding: 10,
    fontSize: 13.5,
    fontFamily: 'var(--font-body)',
    resize: 'vertical',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    background: 'var(--surface-raised)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    padding: '9px 10px',
    fontSize: 13.5,
    marginBottom: 12,
  },
  label: {
    display: 'block',
    fontSize: 12,
    color: 'var(--text-muted)',
    marginBottom: 5,
    fontFamily: 'var(--font-mono)',
  },
  error: {
    color: 'var(--stage-rejected)',
    fontSize: 12.5,
    marginBottom: 10,
  },
  moreToggle: {
    background: 'transparent',
    border: 'none',
    color: 'var(--accent)',
    fontSize: 12.5,
    cursor: 'pointer',
    padding: 0,
    marginBottom: 10,
    textAlign: 'left',
  },
  moreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 10,
    marginBottom: 12,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
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