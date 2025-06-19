import React, { useState, useEffect } from 'react'

const estados = ['en progreso', 'bloqueada', 'finalizada']

const ActividadForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('')
  const [hours, setHours] = useState('0')
  const [observation, setObservation] = useState('')
  const [status, setStatus] = useState(estados[0])
  const [timer, setTimer] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    let interval
    if (running) {
      interval = setInterval(() => {
        setTimer(t => t + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [running])

  const handleSubmit = () => {
    onSubmit({
      title,
      hours: parseFloat(hours) + timer / 3600,
      observation,
      status,
      date: new Date().toISOString(),
    })
    setTitle('')
    setHours('0')
    setObservation('')
    setTimer(0)
  }

  return (
    <div className="p-4 bg-zinc-800 text-white rounded-xl shadow-md space-y-3">
      <input
        className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Título"
      />
      <input
        className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="number"
        value={hours}
        onChange={e => setHours(e.target.value)}
        placeholder="Horas"
      />
      <div className="flex flex-wrap gap-2 items-center">
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm font-medium rounded-lg transition-colors"
          onClick={() => setRunning(!running)}
        >
          {running ? 'Pausar' : 'Cronómetro'} ({Math.floor(timer / 60)}m)
        </button>
        <select
          className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          {estados.map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>
      <input
        className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={observation}
        onChange={e => setObservation(e.target.value)}
        placeholder="Observación"
      />
      <button
        className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        onClick={handleSubmit}
      >
        Guardar
      </button>
    </div>
  )
}

export default ActividadForm