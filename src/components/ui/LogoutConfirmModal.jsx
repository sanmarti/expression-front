export default function LogoutConfirmModal({ onConfirm, onCancel }) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#141E35', border: '1px solid #1C2B45', borderRadius: 16,
          padding: 32, width: 360, textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 22, marginBottom: 10 }}>👋</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.92)', marginBottom: 8 }}>
          Log out?
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>
          You'll be returned to the landing page.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, height: 42, borderRadius: 8, border: '1px solid #1C2B45',
              background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 14,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, height: 42, borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg,#EF4444,#B91C1C)',
              color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
