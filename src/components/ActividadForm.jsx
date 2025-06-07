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
    <div className="border p-2 mt-2">
      <input
        className="border px-1 mr-1"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Título"
      />
      <input
        className="border px-1 mr-1"
        type="number"
        value={hours}
        onChange={e => setHours(e.target.value)}
        placeholder="Horas"
      />
      <button className="bg-gray-300 px-2 mr-1" onClick={() => setRunning(!running)}>
        {running ? 'Pausar' : 'Cronómetro'} ({Math.floor(timer / 60)}m)
      </button>
      <select className="border px-1 mr-1" value={status} onChange={e => setStatus(e.target.value)}>
        {estados.map(e => (
          <option key={e}>{e}</option>
        ))}
      </select>
      <input
        className="border px-1 mr-1"
        value={observation}
        onChange={e => setObservation(e.target.value)}
        placeholder="Observación"
      />
      <button className="bg-green-500 text-white px-2" onClick={handleSubmit}>
        Guardar
      </button>
    </div>
  )
}

export default ActividadForm
