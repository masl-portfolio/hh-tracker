// src/components/GraficoEsfuerzo.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Función para procesar los datos del proyecto y prepararlos para el gráfico
const procesarDatosParaGrafico = (tasks) => {
  const todasLasActividades = tasks
    .flatMap(task => task.activities || [])
    .filter(act => act.fechaInicio && act.fechaFin) // Asegurarse de que la actividad esté completa
    .sort((a, b) => a.fechaFin - b.fechaFin); // Ordenar cronológicamente

  if (todasLasActividades.length === 0) {
    return { data: [], totalHorasEstimadas: 0 };
  }

  const totalHorasEstimadas = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
  
  const fechaInicioProyecto = todasLasActividades[0].fechaInicio;
  const fechaFinProyecto = todasLasActividades[todasLasActividades.length - 1].fechaFin;
  const duracionTotalProyectoMs = fechaFinProyecto - fechaInicioProyecto;

  let horasEjecutadasAcumuladas = 0;
  
  const data = todasLasActividades.map(actividad => {
    const duracionActividadMs = actividad.fechaFin - actividad.fechaInicio;
    horasEjecutadasAcumuladas += duracionActividadMs / 3600000; // Convertir ms a horas

    const tiempoTranscurridoDesdeInicioMs = actividad.fechaFin - fechaInicioProyecto;
    const progresoIdeal = duracionTotalProyectoMs > 0 ? tiempoTranscurridoDesdeInicioMs / duracionTotalProyectoMs : 0;
    const horasIdealesAcumuladas = progresoIdeal * totalHorasEstimadas;

    return {
      // Formatear la fecha para el eje X
      fecha: new Date(actividad.fechaFin).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      ejecutado: parseFloat(horasEjecutadasAcumuladas.toFixed(2)),
      ideal: parseFloat(horasIdealesAcumuladas.toFixed(2)),
    };
  });
  
  // Añadir un punto inicial para que el gráfico comience en cero
  const puntoInicial = {
      fecha: new Date(fechaInicioProyecto).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      ejecutado: 0,
      ideal: 0
  };
  
  return { data: [puntoInicial, ...data], totalHorasEstimadas };
};


const GraficoEsfuerzo = ({ tasks }) => {
  const { data, totalHorasEstimadas } = procesarDatosParaGrafico(tasks);

  if (data.length <= 1) {
    return (
      <div className="h-64 flex items-center justify-center bg-zinc-800/50 rounded-lg text-zinc-500 text-sm">
        No hay suficientes datos de actividades para generar un gráfico.
      </div>
    );
  }

  return (
    <div className="w-full h-64 mt-4 animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
          <XAxis dataKey="fecha" stroke="#a1a1aa" tick={{ fontSize: 12 }} />
          <YAxis stroke="#a1a1aa" tick={{ fontSize: 12 }} domain={[0, dataMax => Math.max(totalHorasEstimadas, dataMax)]}>
             <label value="Horas" offset={0} position="insideLeft" angle={-90} style={{ textAnchor: 'middle', fill: '#a1a1aa', fontSize: 14 }}/>
          </YAxis>
          <Tooltip 
            contentStyle={{ backgroundColor: '#27272a', border: '1px solid #404040', borderRadius: '0.5rem' }} 
            labelStyle={{ color: '#e4e4e7' }}
          />
          <Legend wrapperStyle={{fontSize: "12px"}}/>
          <Line 
            type="monotone" 
            dataKey="ejecutado" 
            stroke="#38bdf8" // Azul brillante
            strokeWidth={2} 
            name="Esfuerzo Ejecutado"
            dot={{ r: 4, fill: '#38bdf8' }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="ideal" 
            stroke="#a1a1aa" // Gris
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Línea Ideal"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoEsfuerzo;