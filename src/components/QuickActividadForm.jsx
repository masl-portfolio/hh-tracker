import React, { useState, useEffect } from 'react'
import { FiSave } from 'react-icons/fi'

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
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-sm p-3 mb-3 flex items-center gap-2">
      <input
        className="flex-1 bg-white/20 border border-white/20 rounded px-3 py-1 text-sm focus:outline-none"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Actividad"
      />
      <input
        className="w-20 bg-white/20 border border-white/20 rounded px-2 py-1 text-sm text-center focus:outline-none"
        type="number"
        value={hours}
        onChange={e => setHours(e.target.value)}
        placeholder="Horas"
      />
      <span className="text-xs text-white/80 w-12 text-center">
        {Math.floor(timer / 60)}m
      </span>
      <button
        aria-label="Guardar actividad"
        className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
        onClick={handleSubmit}
      >
        <FiSave />
      </button>
    </div>
  )
}

export default QuickActividadForm
