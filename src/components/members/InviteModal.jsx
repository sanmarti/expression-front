import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import { inviteMember } from '../../api/members.js'
import { useToast } from '../ui/Toast.jsx'
import { useNavigate } from 'react-router-dom'

export default function InviteModal({ open, onClose, onSuccess, limitReached }) {
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', role: 'member' })
  const [loading, setLoading] = useState(false)

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    background: '#0B1120', border: '1px solid #1C2B45',
    color: 'rgba(255,255,255,0.92)', fontSize: 14, outline: 'none',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await inviteMember(form.email, form.role)
      toast('Invitation sent!', 'success')
      onSuccess?.()
      onClose()
      setForm({ email: '', role: 'member' })
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to send invite', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite Member">
      {limitReached && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 16,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: 'rgba(255,255,255,0.92)', fontSize: 13,
        }}>
          You've reached your member limit. Upgrade your plan to invite more members.
          <button
            onClick={() => navigate('/subscription')}
            style={{
              marginLeft: 12, padding: '4px 12px', borderRadius: 6, border: 'none',
              background: '#3B82F6', color: 'white', cursor: 'pointer', fontSize: 12,
            }}
          >
            View Plans
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Email</label>
          <input
            type="email"
            style={inputStyle}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            placeholder="colleague@company.com"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Role</label>
          <select style={inputStyle} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" onClick={onClose}
            style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #1C2B45', background: 'transparent', color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" disabled={loading || limitReached}
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', cursor: loading || limitReached ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#3B82F6,#14B8A6)', color: 'white', fontWeight: 600, opacity: loading || limitReached ? 0.5 : 1 }}>
            {loading ? 'Sending…' : 'Send Invitation'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
