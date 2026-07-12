import { useState, useEffect, useRef } from 'react'

export default function PlaneIcon({ stakeholders }) {
  const [pos, setPos] = useState({ x: 500, y: 350 })
  const [angle, setAngle] = useState(0)
  const indexRef = useRef(0)

  useEffect(() => {
    if (!stakeholders.length) {
      // circle around island center
      let t = 0
      const id = setInterval(() => {
        t += 0.02
        setPos({ x: 500 + Math.cos(t) * 180, y: 350 + Math.sin(t) * 120 })
        setAngle((t * 180) / Math.PI + 90)
      }, 50)
      return () => clearInterval(id)
    }

    const visit = () => {
      const s = stakeholders[indexRef.current % stakeholders.length]
      const tx = (s.position_x ?? 50) * 10
      const ty = (s.position_y ?? 50) * 7
      setPos({ x: tx, y: ty })
      setAngle(Math.atan2(ty - pos.y, tx - pos.x) * (180 / Math.PI) + 90)
      indexRef.current += 1
    }

    visit()
    const id = setInterval(visit, 5000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stakeholders])

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y}) rotate(${angle})`}
      style={{ transition: 'transform 3s ease-in-out', pointerEvents: 'none' }}
    >
      <path d="M0,-8 L6,8 L0,4 L-6,8 Z" fill="#F59E0B" />
      <path d="M-12,2 L0,-2 L12,2 L0,0 Z" fill="#FCD34D" />
    </g>
  )
}
