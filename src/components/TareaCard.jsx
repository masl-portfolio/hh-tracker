import React, { useContext, useState, useEffect } from 'react';
import AppContext from '../context/AppContext';
import Cronometro from './Cronometro';
import HistorialActividades from './HistorialActividades';
import ModalConfirmacion from './ModalConfirmacion';
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
  FiCalendar,
  FiCheckCircle,
  FiLock,
  FiXCircle
} from 'react-icons/fi';

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
    setFechaFinOficial,
    deleteTask, 
    editTask 
  } = useContext(AppContext);

  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  const [editTitle, setEditTitle] = useState(task.title);
  const [editHours, setEditHours] = useState(String(task.estimatedHours));
  const [finalHoursInput, setFinalHoursInput] = useState(
    task.finalHours !== null && task.finalHours !== undefined ? String(task.finalHours) : ''
  );
  const [fechaOficialInput, setFechaOficialInput] = useState(toInputDateString(task.fechaFinOficial));

  const totalConsumedHours = (task.activities || []).reduce((sum, act) => (act.fechaFin && act.fechaInicio ? sum + (act.fechaFin - act.fechaInicio) : sum), 0) / 3600000;
  const estimatedHours = task.estimatedHours || 0;
  const hoursToCompare = task.finalHours !== null && task.finalHours !== undefined ? task.finalHours : totalConsumedHours;
  const progressPercent = estimatedHours > 0 ? (hoursToCompare / estimatedHours) * 100 : 0;
  const isEffortExceeded = hoursToCompare > estimatedHours;
  const isDateExceeded = task.fechaFinOficial && task.fechaFinEstimada && task.fechaFinOficial > new Date(task.fechaFinEstimada).getTime();
  const isThisTaskActive = activeTask?.taskId === task.id;
  const isAnyTaskActive = activeTask !== null;
  const hasActivities = task.activities && task.activities.length > 0;

  useEffect(() => {
    setFinalHoursInput(task.finalHours !== null && task.finalHours !== undefined ? String(task.finalHours) : '');
    setFechaOficialInput(toInputDateString(task.fechaFinOficial));
  }, [task.finalHours, task.fechaFinOficial]);
  
  const handleFinalHoursChange = (e) => setFinalHoursInput(e.target.value);
  const handleFinalHoursBlur = () => {
    const value = parseFloat(finalHoursInput);
    setFinalTaskHours(projectId, task.id, !isNaN(value) && value >= 0 ? value : null);
  };
  
  const handleFechaOficialChange = (e) => {
    const newDate = e.target.value;
    setFechaOficialInput(newDate);
    setFechaFinOficial(projectId, task.id, newDate);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      alert("El título de la tarea no puede estar vacío.");
      return;
    }
    editTask(projectId, task.id, { title: editTitle.trim(), estimatedHours: parseFloat(editHours) || 0 });
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditHours(String(task.estimatedHours));
    setIsEditing(false);
  };

  const handleDelete = () => {
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    deleteTask(projectId, task.id);
    setIsModalOpen(false);
  };
  
  const cancelDelete = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        className={`bg-zinc-800/50 border rounded-xl p-4 space-y-3 shadow-md transition-all ${isThisTaskActive ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-zinc-700'}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {isEditing ? (
          <div className="space-y-2">
            <input 
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 text-sm" 
              value={editTitle} 
              onChange={e => setEditTitle(e.target.value)} 
              placeholder="Título de la tarea"
            />
            <input 
              type="number" 
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 text-sm" 
              value={editHours} 
              onChange={e => setEditHours(e.target.value)}
              placeholder="Horas estimadas" 
            />
            <div className="flex gap-2 text-sm mt-1">
              <button onClick={handleSaveEdit} className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                <FiSave size={14}/>Guardar
              </button>
              <button onClick={handleCancelEdit} className="flex items-center gap-1 px-2 py-1 bg-zinc-600 text-white rounded hover:bg-zinc-700">
                <FiX size={14}/>Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-white text-base">{task.title}</h3>
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
                  <span title="Tiempo lineal (real invertido)">{totalConsumedHours.toFixed(1)}h</span> / <span title="Horas estimadas">{estimatedHours}h</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-1.5" title={`Progreso basado en ${task.finalHours !== null && task.finalHours !== undefined ? 'HH Finales' : 'Tiempo Lineal'}`}>
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${isEffortExceeded ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, progressPercent)}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                {isThisTaskActive ? (
                  <>
                    <button onClick={pauseTask} className="flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-full shadow-lg" title="Pausar"><FiPause size={20}/></button>
                    <Cronometro startTime={activeTask.startTime} />
                  </>
                ) : (
                  <button 
                    onClick={() => startTask(projectId, task.id)} 
                    disabled={isAnyTaskActive} 
                    className={`flex flex-col items-center justify-center w-12 h-12 text-white rounded-full shadow-lg disabled:bg-zinc-600 disabled:cursor-not-allowed transition-colors
                      ${hasActivities 
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-green-500 hover:bg-green-600'
                      }`
                    }
                    title={isAnyTaskActive ? "Hay otra tarea en ejecución" : (hasActivities ? "Reanudar Tarea" : "Iniciar Tarea")}
                  >
                    {hasActivities ? <FiRepeat size={20}/> : <FiPlay size={20} className="ml-0.5"/>}
                    <span className='text-[8px] font-bold mt-0.5'>{hasActivities ? "REANUDAR" : "INICIAR"}</span>
                  </button>
                )}
              </div>
            </div>
            
            {isThisTaskActive && (
              <div className="mt-3 animate-fade-in">
                <textarea
                  className="w-full rounded-md border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-400"
                  rows="2"
                  placeholder="Añadir un comentario sobre esta sesión..."
                  value={activeTask.observation || ''}
                  onChange={(e) => updateActiveTaskObservation(e.target.value)}
                />
              </div>
            )}

            <div className="border-t border-zinc-700/50 pt-2 flex flex-wrap justify-between items-center gap-2">
               <div className='flex items-center gap-2'>
                  <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1.5 text-zinc-300 hover:text-white text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded-md">
                      {showHistory ? <FiEyeOff size={14} /> : <FiEye size={14} />}Historial
                  </button>
               </div>
               <div className="flex items-center gap-2 flex-wrap justify-end">
                  {hovered && !isThisTaskActive ? (
                    <div className="flex items-center gap-1 animate-fade-in-fast">
                      <button onClick={() => setTaskStatus(projectId, task.id, 'completada')} title="Marcar como Completada" className="p-1.5 text-zinc-400 hover:text-green-500 hover:bg-green-500/20 rounded-full"><FiCheckCircle size={16}/></button>
                      <button onClick={() => setTaskStatus(projectId, task.id, 'bloqueada')} title="Marcar como Bloqueada" className="p-1.5 text-zinc-400 hover:text-orange-400 hover:bg-orange-500/20 rounded-full"><FiLock size={16}/></button>
                      <button onClick={() => setTaskStatus(projectId, task.id, 'cancelada')} title="Cancelar Tarea" className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/20 rounded-full"><FiXCircle size={16}/></button>
                    </div>
                  ) : (
                    <div className="w-24 h-8"></div>
                  )}
                  <div title={`Fecha Estimada: ${task.fechaFinEstimada ? new Date(task.fechaFinEstimada).toLocaleDateString() : 'N/A'}`}>
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

      <ModalConfirmacion
        isOpen={isModalOpen}
        titulo="Eliminar Tarea"
        mensaje={`¿Estás seguro de que quieres eliminar la tarea "${task.title}"? Todos sus registros se perderán.`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        textoConfirmar="Sí, eliminar"
      />
    </>
  );
};

export default TareaCard;