import React, { useContext, useState, useEffect } from 'react';
import AppContext from '../context/AppContext';
import Cronometro from './Cronometro';
import HistorialActividades from './HistorialActividades';
import { 
  FiPlay, 
  FiPause, 
  FiAlertTriangle, 
  FiHeart, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiEyeOff, 
  FiSave, 
  FiX,
  FiRepeat,
  FiCalendar
} from 'react-icons/fi';

// Función para formatear fechas en YYYY-MM-DD para el input de fecha
const toInputDateString = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toISOString().split('T')[0];
};

const TareaCard = ({ projectId, task }) => {
  const { 
    activeTask, 
    startTask, 
    pauseTask, 
    updateActiveTaskObservation, 
    setTaskStatus, 
    setFinalTaskHours,
    setFechaFinOficial, // <-- Nueva función del contexto
    deleteTask, 
    moveTask, 
    editTask 
  } = useContext(AppContext);

  // Estados locales del componente
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editHours, setEditHours] = useState(String(task.estimatedHours));
  const [finalHoursInput, setFinalHoursInput] = useState(
    task.finalHours !== null && task.finalHours !== undefined ? String(task.finalHours) : ''
  );
  // Nuevo estado para el input de fecha oficial
  const [fechaOficialInput, setFechaOficialInput] = useState(toInputDateString(task.fechaFinOficial));

  // --- LÓGICA DE TIEMPO Y SALUD ---
  const totalConsumedHours = (task.activities || []).reduce((sum, act) => {
    return (act.fechaFin && act.fechaInicio) ? sum + (act.fechaFin - act.fechaInicio) : sum;
  }, 0) / 3600000;

  const estimatedHours = task.estimatedHours || 0;
  const hoursToCompare = task.finalHours !== null && task.finalHours !== undefined ? task.finalHours : totalConsumedHours;
  const progressPercent = estimatedHours > 0 ? (hoursToCompare / estimatedHours) * 100 : 0;
  const isEffortExceeded = hoursToCompare > estimatedHours;
  
  // Nueva lógica para la salud del plazo
  const isDateExceeded = task.fechaFinOficial && task.fechaFinEstimada && task.fechaFinOficial > task.fechaFinEstimada;

  const isThisTaskActive = activeTask?.taskId === task.id;
  const isAnyTaskActive = activeTask !== null;
  const hasActivities = task.activities && task.activities.length > 0;

  // --- MANEJADORES DE EVENTOS ---
  useEffect(() => {
    setFinalHoursInput(task.finalHours !== null && task.finalHours !== undefined ? String(task.finalHours) : '');
    setFechaOficialInput(toInputDateString(task.fechaFinOficial));
  }, [task.finalHours, task.fechaFinOficial]);
  
  const handleFinalHoursChange = (e) => setFinalHoursInput(e.target.value);
  const handleFinalHoursBlur = () => {
    const value = parseFloat(finalHoursInput);
    setFinalTaskHours(projectId, task.id, !isNaN(value) && value >= 0 ? value : null);
  };
  
  // Nuevo manejador para la fecha oficial
  const handleFechaOficialChange = (e) => {
    const newDate = e.target.value;
    setFechaOficialInput(newDate);
    setFechaFinOficial(projectId, task.id, newDate);
  };

  const handleSaveEdit = () => { /* sin cambios */ };
  const handleCancelEdit = () => { /* sin cambios */ };
  const handleDelete = () => { /* sin cambios */ };

  return (
    <div className={`bg-zinc-800/50 border rounded-xl p-4 space-y-3 shadow-md transition-all ${isThisTaskActive ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-zinc-700'}`}>
      {isEditing ? (
        <div className="space-y-2">{/* ... Vista de edición sin cambios ... */}</div>
      ) : (
        <>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-white text-base">{task.title}</h3>
                {/* --- DOBLE INDICADOR DE SALUD --- */}
                <div title={isEffortExceeded ? `Desviado por ${(hoursToCompare - estimatedHours).toFixed(1)}h` : `Esfuerzo saludable`} className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${isEffortExceeded ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'}`}>
                  {isEffortExceeded ? <FiAlertTriangle size={14}/> : <FiHeart size={14}/>}
                  <span>Esfuerzo</span>
                </div>
                {task.fechaFinEstimada && (
                  <div title={isDateExceeded ? `Retrasado` : `En Plazo`} className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${isDateExceeded ? 'text-orange-400 bg-orange-500/10' : 'text-green-400 bg-green-500/10'}`}>
                    <FiCalendar size={14}/>
                    <span>Plazo</span>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-zinc-400">
                <span title="Tiempo lineal">{totalConsumedHours.toFixed(1)}h</span> / <span title="Horas estimadas">{estimatedHours}h</span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-1.5" title={`Progreso de esfuerzo`}>
                <div className={`h-1.5 rounded-full ${isEffortExceeded ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, progressPercent)}%` }}></div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">{/* ... Botón Play/Pausa sin cambios ... */}</div>
          </div>
          
          {isThisTaskActive && ( <div className="mt-3 animate-fade-in">{/* ... Textarea sin cambios ... */}</div> )}

          <div className="border-t border-zinc-700/50 pt-2 flex flex-wrap justify-between items-center gap-2">
             <div className='flex items-center gap-2'>
                <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1.5 text-zinc-300 hover:text-white text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded-md">
                    {showHistory ? <FiEyeOff size={14} /> : <FiEye size={14} />}Historial
                </button>
             </div>
             <div className="flex items-center gap-2 flex-wrap justify-end">
                {/* --- NUEVOS INPUTS DE FECHAS --- */}
                <div title={`Fecha Estimada: ${new Date(task.fechaFinEstimada).toLocaleDateString()}`}>
                    <input type="date" disabled value={toInputDateString(task.fechaFinEstimada)} className="w-28 bg-zinc-900/50 border-zinc-700 rounded-md py-1 px-2 text-xs text-zinc-400 cursor-not-allowed"/>
                </div>
                <div title="Fecha Oficial (actualizada automáticamente, editable)">
                    <input type="date" value={fechaOficialInput} onChange={handleFechaOficialChange} className="w-28 bg-zinc-700 border-zinc-600 rounded-md py-1 px-2 text-xs text-white"/>
                </div>
                <input
                    type="number"
                    className="w-20 bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-xs text-center text-white"
                    placeholder="HH Final"
                    title="Horas Finales (Facturables)"
                    value={finalHoursInput}
                    onChange={handleFinalHoursChange}
                    onBlur={handleFinalHoursBlur}
                />
                <select value={task.status} onChange={(e) => setTaskStatus(projectId, task.id, e.target.value)} className="bg-zinc-700 border-zinc-600 text-xs text-white px-2 py-1 rounded-md">
                    <option value="backlog">Backlog</option>
                    <option value="en desarrollo">En desarrollo</option>
                    <option value="bloqueada">Bloqueada</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                </select>
                <button title="Editar" className="p-1.5 rounded-md text-zinc-400 hover:text-blue-400" onClick={() => setIsEditing(true)}><FiEdit size={16}/></button>
                <button title="Eliminar" className="p-1.5 rounded-md text-zinc-400 hover:text-red-500" onClick={handleDelete}><FiTrash2 size={16}/></button>
             </div>
          </div>
          {showHistory && <HistorialActividades projectId={projectId} taskId={task.id} activities={task.activities || []} />}
        </>
      )}
    </div>
  );
};

export default TareaCard;