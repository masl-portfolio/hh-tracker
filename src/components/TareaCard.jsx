import React, { useContext, useState } from 'react';
import AppContext from '../context/AppContext';
import Cronometro from './Cronometro';
import HistorialActividades from './HistorialActividades';
import { FiPlay, FiPause, FiAlertTriangle, FiHeart, FiEdit, FiTrash2, FiChevronUp, FiChevronDown, FiEye, FiEyeOff, FiSave, FiX } from 'react-icons/fi';

const TareaCard = ({ projectId, task }) => {
  const { activeTask, startTask, pauseTask, updateActiveTaskObservation, setTaskStatus, deleteTask, moveTask, editTask } = useContext(AppContext);

  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editHours, setEditHours] = useState(String(task.estimatedHours));
  
  const totalConsumedMs = (task.activities || []).reduce((sum, act) => {
    return (act.fechaFin && act.fechaInicio) ? sum + (act.fechaFin - act.fechaInicio) : sum;
  }, 0);

  const totalConsumedHours = totalConsumedMs / 3600000;
  const estimatedHours = task.estimatedHours || 0;
  const remainingHours = estimatedHours - totalConsumedHours;
  const isExceeded = remainingHours < 0;

  const isThisTaskActive = activeTask?.taskId === task.id;
  const isAnyTaskActive = activeTask !== null;

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
    if (window.confirm(`¿Estás seguro de que quieres eliminar la tarea "${task.title}"?`)) {
        deleteTask(projectId, task.id);
    }
  };

  return (
    <div className={`bg-zinc-800/50 border rounded-xl p-4 space-y-3 shadow-md transition-all ${isThisTaskActive ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-zinc-700'}`}>
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
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-white text-base">{task.title}</h3>
                {isExceeded ? (
                  <div title={`Excedido por ${Math.abs(remainingHours).toFixed(1)}h`} className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full"><FiAlertTriangle size={14}/><span>Desviado</span></div>
                ) : (
                  <div title={`Quedan ${remainingHours.toFixed(1)}h`} className="flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full"><FiHeart size={14}/><span>Saludable</span></div>
                )}
              </div>
              <div className="text-xs text-zinc-400">{totalConsumedHours.toFixed(1)}h / {estimatedHours}h</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              {isThisTaskActive ? (
                <>
                  <button onClick={pauseTask} className="flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all transform hover:scale-105" title="Pausar Tarea"><FiPause size={20}/></button>
                  <Cronometro startTime={activeTask.startTime} />
                </>
              ) : (
                <button onClick={() => startTask(projectId, task.id)} disabled={isAnyTaskActive} className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all transform hover:scale-105 disabled:bg-zinc-600 disabled:cursor-not-allowed disabled:transform-none border-2 border-transparent hover:border-white/50" title={isAnyTaskActive ? "Hay otra tarea en ejecución" : "Iniciar Tarea"}><FiPlay size={20} className="ml-1"/></button>
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

          <div className="border-t border-zinc-700/50 pt-2 flex justify-between items-center">
             <div className='flex gap-2'>
                <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1.5 text-zinc-300 hover:text-white text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded-md">
                    {showHistory ? <FiEyeOff size={14} /> : <FiEye size={14} />}Historial
                </button>
             </div>
             <div className="flex items-center gap-1">
                <select value={task.status} onChange={(e) => setTaskStatus(projectId, task.id, e.target.value)} className="bg-zinc-700 border-zinc-600 text-xs text-white px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="backlog">Backlog</option>
                  <option value="en desarrollo">En desarrollo</option>
                  <option value="bloqueada">Bloqueada</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
                <button title="Editar" className="p-1.5 rounded-md text-zinc-400 hover:text-blue-400 hover:bg-zinc-700" onClick={() => setIsEditing(true)}><FiEdit size={16}/></button>
                <button title="Eliminar" className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-zinc-700" onClick={handleDelete}><FiTrash2 size={16}/></button>
             </div>
          </div>
          {showHistory && <HistorialActividades projectId={projectId} taskId={task.id} activities={task.activities || []} />}
        </>
      )}
    </div>
  );
};

export default TareaCard;