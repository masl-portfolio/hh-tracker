import React from 'react'

const DashboardPagos = ({ activities, horaUF = 0.5 }) => {
  const pendientes = activities.filter(a => !a.paid)
  const totalHoras = pendientes.reduce((sum, a) => sum + a.hours, 0)
  const totalUF = totalHoras * horaUF

  return (
    <div className="p-2">
      <h2 className="font-bold mb-2">Horas pendientes de pago</h2>
      <p>Total horas: {totalHoras.toFixed(2)}</p>
      <p>Total UF: {totalUF.toFixed(2)}</p>
    </div>
  )
}

export default DashboardPagos
