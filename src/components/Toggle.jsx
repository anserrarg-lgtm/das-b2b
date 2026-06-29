export default function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: '36px',
        height: '20px',
        borderRadius: '10px',
        background: value ? '#B0FF92' : 'rgba(255,255,255,0.1)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s ease',
        flexShrink: 0
      }}
    >
      <div style={{
        position: 'absolute',
        top: '3px',
        left: value ? '19px' : '3px',
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        background: value ? '#121716' : '#A3AEAC',
        transition: 'left 0.2s ease'
      }}/>
    </div>
  )
}
