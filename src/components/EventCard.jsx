import React, { useContext } from 'react';
import AppContext from '../context/AppContext';
import { 
  FiPaperclip, 
  FiSquare, 
  FiCheckSquare, 
  FiUsers, 
  FiFlag, 
  FiTrash2, 
  FiAlertTriangle 
} from 'react-icons/fi';

// Objeto para mapear tipos de evento a sus estilos e iconos
const eventTypeStyles = {
  nota: { icon: FiPaperclip, color: 'text-zinc-400' },
  pendiente: { icon: FiSquare, color: 'text-blue-400' },
  decision: { icon: FiCheckSquare, color: 'text-purple-400' },
  acuerdo: { icon: FiUsers, color: 'text-teal-400' },
  hito: { icon: FiFlag, color: 'text-yellow-400' },
  aviso: { icon: FiAlertTriangle, color: 'text-orange-400' }
};

const EventCard = ({ event }) => {
  const { toggleEventCompleted, deleteEvent, projects } = useContext(AppContext);

  // Obtener los estilos o usar valores por defecto
  const style = eventTypeStyles[event.type] || eventTypeStyles.nota;
  const EventIcon = style.icon;

  // Encontrar el nombre del proyecto y la tarea si están vinculados
  let contextInfo = null;
  if (event.projectId) {
    const project = projects.find(p => p.id === event.projectId);
    if (project) {
      contextInfo = { projectName: project.name };
      if (event.taskId) {
        const task = project.tasks.find(t => t.id === event.taskId);
        if (task) {
          contextInfo.taskName = task.title;
        }
      }
    }
  }

  const handleDelete = (e) => {
    e.stopPropagation(); // Evitar que el clic en el botón active el toggle del checkbox
    if(window.confirm(`¿Seguro que quieres eliminar el evento: "${event.title}"?`)) {
      deleteEvent(event.id);
    }
  };

  return (
    <div 
      className={`p-3 rounded-lg border transition-all duration-200 ${
        event.isCompleted 
          ? 'bg-zinc-800/50 border-zinc-800 opacity-60' 
          : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700/60'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox y icono */}
        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={() => toggleEventCompleted(event.id)} 
            className="flex-shrink-0"
            title={event.isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}
          >
            {event.isCompleted 
              ? <FiCheckSquare className="text-green-500" size={20} />
              : <EventIcon className={style.color} size={20} />
            }
          </button>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${event.isCompleted ? 'line-through text-zinc-500' : 'text-white'}`}>
            {event.title}
          </h4>
          {event.details && (
            <p className={`text-xs mt-1 ${event.isCompleted ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {event.details}
            </p>
          )}

          {/* Información de contexto (Proyecto/Tarea) */}
          {contextInfo && (
            <div className="mt-2 text-[10px] text-zinc-500 bg-black/20 px-2 py-1 rounded w-fit">
              <span>{contextInfo.projectName}</span>
              {contextInfo.taskName && <span> {' > '} {contextInfo.taskName}</span>}
            </div>
          )}
        </div>

        {/* Botón de eliminar */}
        <button 
          onClick={handleDelete}
          className="text-zinc-500 hover:text-red-500 p-1 rounded-full hover:bg-red-500/10"
          title="Eliminar evento"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default EventCard;