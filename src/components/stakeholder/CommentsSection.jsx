import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { getComments, postComment } from '../../api/climate.js'
import { getAvatar } from '../../constants/avatars.js'
import useAuthStore from '../../store/authStore.js'
import { useToast } from '../ui/Toast.jsx'

const PREVIEW_LIMIT = 120

function fmtStamp(d) {
  const date = new Date(d)
  return new Intl.DateTimeFormat('en', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(date)
}

function Avatar({ member, size = 32 }) {
  const av = getAvatar(member.selected_avatar)
  const [src, setSrc] = useState(av?.src)
  useEffect(() => { if (av) setSrc(av.src) }, [av?.id])

  if (av) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `2px solid ${av.color}` }}>
        <img src={src} onError={() => setSrc(av.placeholder)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%' }} />
      </div>
    )
  }
  const initials = (member.display_name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', border: '2px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 700, color: 'rgba(255,255,255,0.40)', flexShrink: 0 }}>
      {initials}
    </div>
  )
}

function NoteModal({ comment, isMe, onClose }) {
  const handleKey = useCallback((e) => { if (e.key === 'Escape') onClose() }, [onClose])
  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 580, maxHeight: '80vh',
          background: '#141E35', border: '1px solid #1C2B45',
          borderRadius: 16, display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 24px', borderBottom: '1px solid #1C2B45', flexShrink: 0 }}>
          <Avatar member={comment} size={40} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: isMe ? '#3B82F6' : 'rgba(255,255,255,0.92)' }}>
              {comment.display_name || 'Unknown'}
              {isMe && <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.30)', marginLeft: 6 }}>you</span>}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', marginTop: 2 }}>
              {fmtStamp(comment.created_at)}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 8, color: 'rgba(255,255,255,0.50)', cursor: 'pointer',
              fontSize: 18, lineHeight: 1, padding: '6px 10px', flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Modal body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.88)', lineHeight: 1.75,
            margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {comment.content}
          </p>
        </div>

        {/* Modal footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #1C2B45', flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.20)', fontFamily: 'monospace' }}>
            Press Esc to close
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function CommentsSection({ stakeholderId, fullHeight = false }) {
  const toast = useToast()
  const { user } = useAuthStore()
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [openNote, setOpenNote] = useState(null)

  useEffect(() => {
    getComments(stakeholderId)
      .then(({ data }) => setComments([...data].reverse()))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [stakeholderId])

  const handlePost = async () => {
    if (!text.trim()) return
    setPosting(true)
    try {
      const { data } = await postComment(stakeholderId, text.trim())
      setComments((prev) => [data, ...prev])
      setText('')
    } catch {
      toast('Failed to post comment', 'error')
    } finally {
      setPosting(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost()
  }

  const threadStyle = fullHeight
    ? { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4 }
    : { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16, maxHeight: 340, overflowY: 'auto', paddingRight: 4 }

  return (
    <div style={fullHeight ? { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: 0 } : {}}>
      {!fullHeight && (
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
          Comments {comments.length > 0 && <span style={{ color: 'rgba(255,255,255,0.20)' }}>({comments.length})</span>}
        </div>
      )}

      {/* Thread */}
      <div style={threadStyle}>
        {loading ? (
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '16px 0' }}>Loading…</div>
        ) : comments.length === 0 ? (
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.20)', textAlign: 'center', padding: '16px 0' }}>No intelligence notes yet. Be the first.</div>
        ) : comments.map((c) => {
          const isMe = c.user_id === user?.id
          const isLong = c.content.length > PREVIEW_LIMIT
          const preview = isLong ? c.content.slice(0, PREVIEW_LIMIT).trimEnd() + '…' : c.content
          return (
            <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Avatar member={c} size={30} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isMe ? '#3B82F6' : 'rgba(255,255,255,0.75)' }}>
                    {c.display_name || 'Unknown'}
                    {isMe && <span style={{ fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,0.30)', marginLeft: 4 }}>you</span>}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', flexShrink: 0 }}>
                    {fmtStamp(c.created_at)}
                  </span>
                </div>
                <div style={{
                  fontSize: 13, color: 'rgba(255,255,255,0.80)', lineHeight: 1.5,
                  background: isMe ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isMe ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 10, padding: '8px 12px',
                }}>
                  {preview}
                </div>
                {isLong && (
                  <button
                    onClick={() => setOpenNote(c)}
                    style={{
                      marginTop: 5, background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 11, fontWeight: 600, color: '#3B82F6', padding: '2px 4px',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Read more →
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0, ...(fullHeight ? { paddingTop: 12 } : {}) }}>
        <Avatar member={user || {}} size={30} />
        <div style={{ flex: 1 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Write a comment… (⌘+Enter to post)"
            rows={2}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: 10, boxSizing: 'border-box',
              background: '#0B1120', border: '1px solid #1C2B45',
              color: 'rgba(255,255,255,0.90)', fontSize: 13, resize: 'none', outline: 'none',
              fontFamily: 'inherit', lineHeight: 1.5,
            }}
          />
        </div>
        <button
          onClick={handlePost}
          disabled={posting || !text.trim()}
          style={{
            padding: '9px 18px', borderRadius: 10, border: 'none', cursor: posting || !text.trim() ? 'not-allowed' : 'pointer',
            background: 'linear-gradient(135deg,#3B82F6,#14B8A6)',
            color: 'white', fontWeight: 600, fontSize: 13,
            opacity: posting || !text.trim() ? 0.45 : 1,
            flexShrink: 0, alignSelf: 'flex-end',
          }}
        >
          {posting ? '…' : 'Post'}
        </button>
      </div>

      {openNote && (
        <NoteModal
          comment={openNote}
          isMe={openNote.user_id === user?.id}
          onClose={() => setOpenNote(null)}
        />
      )}
    </div>
  )
}
