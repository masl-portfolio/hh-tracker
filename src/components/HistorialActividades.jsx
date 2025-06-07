import React from 'react'

const HistorialActividades = ({ activities }) => {
  return (
    <ul className="mt-2">
      {[...activities].reverse().map(act => (
        <li key={act.id} className="border-b py-1">
          <div className="text-sm font-semibold">{act.title}</div>
          <div className="text-xs text-gray-600">
            {new Date(act.date).toLocaleString()} - {act.hours.toFixed(2)}h - {act.status}
          </div>
          {act.observation && <div className="text-xs">{act.observation}</div>}
        </li>
      ))}
    </ul>
  )
}

export default HistorialActividades
