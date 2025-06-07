import React, { useState, useEffect } from 'react'

const QuickActividadForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('')
  const [hours, setHours] = useState('0')
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(t => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = () => {
    if (!title) return
    onSubmit({
      title,
      hours: parseFloat(hours) + timer / 3600,
      observation: '',
      status: 'en progreso',
      date: new Date().toISOString(),
    })
    setTitle('')
    setHours('0')
    setTimer(0)
  }

  return (
    <div className="bg-white rounded shadow p-2 mb-2">
      <input
        className="border px-1 mr-1"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Actividad"
      />
      <input
        className="border px-1 mr-1"
        type="number"
        value={hours}
        onChange={e => setHours(e.target.value)}
        placeholder="Horas"
      />
      <span className="text-sm mr-1">{Math.floor(timer / 60)}m</span>
      <button className="bg-green-500 text-white px-2" onClick={handleSubmit}>
        Guardar
      </button>
    </div>
  )
}

export default QuickActividadForm
