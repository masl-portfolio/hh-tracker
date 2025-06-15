// src/components/TareaCard.jsx (COMPLETO Y HOMOLOGADO)

import React, { useContext, useState, useEffect, useRef } from 'react';
import AppContext from '../context/AppContext';
import Cronometro from './Cronometro';
import HistorialActividades from './HistorialActividades';
import ModalConfirmacion from './ModalConfirmacion';
import toast from 'react-hot-toast';

// Importaciones para Drag and Drop
import { Draggable } from 'react-beautiful-dnd';

import { 
  FiPlay, FiPause, FiAlertTriangle, FiHeart, FiEdit, 
  FiTrash2, FiEye, FiEyeOff, FiSave, FiX, FiRepeat,
  FiCalendar, FiCheckCircle, FiLock, FiXCircle
} from 'react-icons/fi';

const statusStyles = {
  backlog: 'bg-zinc-700 text-zinc-300',
  'en desarrollo': 'bg-blue-500 text-white',
  bloqueada: 'bg-orange-500 text-white',
  completada: 'bg-green-500 text-white',
  cancelada: 'bg-red-500 text-white',
};

const TareaCard = ({ projectId, task, index }) => {
  const { 
    activeTask, startTask, pauseTask, updateActiveTaskObservation, 
    setTaskStatus, deleteTask, editTask 
  } = useContext(AppContext);

  // --- Estados del Componente ---
  // Estado para la edición in-place del título
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(task.title);
  const titleInputRef = useRef(null);
  
  // Estados existentes para la lógica de la tarjeta
  const [showHistory, setShowHistory] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // --- Variables y Cálculos Derivados (tu lógica original) ---
  const isThisTaskActive = activeTask?.taskId === task.id;
  const isAnyTaskActive = activeTask !== null;
  const hasActivities = task.activities && task.activities.length > 0;
  const totalConsumedHours = (task.activities || []).reduce((sum, act) => (act.fechaFin && act.fechaInicio ? sum + (act.fechaFin - act.fechaInicio) : sum), 0) / 3600000;
  const estimatedHours = task.estimatedHours || 0;
  const progressPercent = estimatedHours > 0 ? (totalConsumedHours / estimatedHours) * 100 : 0;
  const isEffortExceeded = totalConsumedHours > estimatedHours;
  const isDateExceeded = task.fechaFinOficial && task.fechaFinEstimada && task.fechaFinOficial > new Date(task.fechaFinEstimada).getTime();


  // --- LÓGICA PARA EDICIÓN IN-PLACE DEL TÍTULO ---
  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleTitleBlur = () => {
    if (currentTitle.trim() && currentTitle.trim() !== task.title) {
      editTask(projectId, task.id, { title: currentTitle.trim() });
      // El toast ya está en editTask en el contexto, no es necesario duplicarlo.
    } else {
      setCurrentTitle(task.title); // Revertir si está vacío o no cambió
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleBlur(); // Guardar
    } else if (e.key === 'Escape') {
      setCurrentTitle(task.title); // Revertir
      setIsEditingTitle(false);
    }
  };

  // --- Lógica para el modal de eliminación ---
  const handleDeleteClick = () => setIsDeleteModalOpen(true);
  const confirmDelete = () => {
    deleteTask(projectId, task.id);
    setIsDeleteModalOpen(false); // No es necesario, el componente se desmontará
  };
  const cancelDelete = () => setIsDeleteModalOpen(false);


  return (
    <>
      <Draggable draggableId={String(task.id)} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`bg-zinc-800/50 border rounded-xl p-4 space-y-3 shadow-md transition-all group ${
              isThisTaskActive ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-zinc-700'
            } ${
              snapshot.isDragging ? 'bg-blue-900/80 shadow-2xl' : 'hover:bg-zinc-800/70'
            }`}
          >
            {/* --- SECCIÓN SUPERIOR: TÍTULO, INFO Y BOTÓN DE ACCIÓN PRINCIPAL --- */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                {/* Título Editable In-place */}
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={handleTitleKeyDown}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-2 py-1 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <h3 
                    onDoubleClick={() => setIsEditingTitle(true)}
                    className="font-semibold text-white text-base truncate cursor-pointer"
                    title={task.title}
                  >
                    {task.title}
                  </h3>
                )}

                {/* Indicadores de Esfuerzo y Plazo */}
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <div title={isEffortExceeded ? `Desviado por ${(totalConsumedHours - estimatedHours).toFixed(1)}h` : `Esfuerzo saludable`} className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${isEffortExceeded ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'}`}>
                    {isEffortExceeded ? <FiAlertTriangle size={12}/> : <FiHeart size={12}/>}
                    <span>Esfuerzo</span>
                  </div>
                  {task.fechaFinEstimada && (
                    <div title={isDateExceeded ? `Retrasado` : `En Plazo`} className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${isDateExceeded ? 'text-orange-400 bg-orange-500/10' : 'text-green-400 bg-green-500/10'}`}>
                      <FiCalendar size={12}/>
                      <span>Plazo</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Botón de Acción Principal (Play/Pause) */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                {isThisTaskActive ? (
                  <>
                    <button onClick={pauseTask} className="flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors" title="Pausar"><FiPause size={20}/></button>
                    <Cronometro startTime={activeTask.startTime} className="text-xs" />
                  </>
                ) : (
                  <button 
                    onClick={() => startTask(projectId, task.id)} 
                    disabled={isAnyTaskActive} 
                    className={`flex flex-col items-center justify-center w-12 h-12 text-white rounded-full shadow-lg disabled:bg-zinc-600 disabled:cursor-not-allowed transition-colors
                      ${hasActivities ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'}`}
                    title={isAnyTaskActive ? "Hay otra tarea en ejecución" : (hasActivities ? "Reanudar Tarea" : "Iniciar Tarea")}
                    {...provided.dragHandleProps} // El drag handle ahora está en el botón de Play/Pause
                  >
                    {hasActivities ? <FiRepeat size={20}/> : <FiPlay size={20} className="ml-0.5"/>}
                  </button>
                )}
              </div>
            </div>

            {/* --- SECCIÓN DE PROGRESO Y OBSERVACIONES --- */}
            <div>
              <div className="text-xs text-zinc-400 flex justify-between mb-1">
                <span title="Tiempo total invertido">{totalConsumedHours.toFixed(1)}h</span>
                <span title="Horas estimadas">{estimatedHours}h</span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${isEffortExceeded ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                ></div>
              </div>
            </div>
            
            {isThisTaskActive && (
              <div className="mt-2 animate-fade-in">
                <textarea
                  className="w-full rounded-md border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-400"
                  rows="2"
                  placeholder="Añadir un comentario sobre esta sesión..."
                  value={activeTask.observation || ''}
                  onChange={(e) => updateActiveTaskObservation(e.target.value)}
                />
              </div>
            )}

            {/* --- SECCIÓN DE ACCIONES SECUNDARIAS --- */}
            <div className="border-t border-zinc-700/50 pt-2 flex justify-between items-center gap-2">
              <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1.5 text-zinc-300 hover:text-white text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded-md">
                {showHistory ? <FiEyeOff size={14} /> : <FiEye size={14} />} Historial
              </button>
              
              <div className="flex items-center gap-1">
                <div className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusStyles[task.status] || 'bg-zinc-500'}`}>
                  {task.status.replace(/-/g, ' ')}
                </div>
                {/* Botones de cambio de estado */}
                <button onClick={() => setTaskStatus(projectId, task.id, 'completada')} title="Completada" className="p-1.5 text-zinc-400 hover:text-green-500"><FiCheckCircle size={16}/></button>
                <button onClick={() => setTaskStatus(projectId, task.id, 'bloqueada')} title="Bloqueada" className="p-1.5 text-zinc-400 hover:text-orange-400"><FiLock size={16}/></button>
                <button onClick={() => setTaskStatus(projectId, task.id, 'cancelada')} title="Cancelada" className="p-1.5 text-zinc-400 hover:text-red-500"><FiXCircle size={16}/></button>
                <span className="border-l border-zinc-600 h-4 mx-1"></span> {/* Separador visual */}
                <button title="Eliminar" className="p-1.5 text-zinc-400 hover:text-red-500" onClick={handleDeleteClick}><FiTrash2 size={16}/></button>
              </div>
            </div>

            {showHistory && <HistorialActividades projectId={projectId} taskId={task.id} activities={task.activities || []} />}
          </div>
        )}
      </Draggable>

      <ModalConfirmacion
        isOpen={isDeleteModalOpen}
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