import React, { useContext } from 'react';
import AppContext from '../context/AppContext';
import { 
  FiPaperclip, 
  FiSquare, 
  FiCheckSquare, 
  FiUsers, 
  FiFlag, 
  FiTrash2, 
  FiAlertTriangle,
  FiCheckCircle // ----- CAMBIO 1: Importar el nuevo icono de check -----
} from 'react-icons/fi';

// ----- CAMBIO 2: Añadir colores de fondo para las etiquetas de tipo -----
const eventTypeStyles = {
  nota: { icon: FiPaperclip, color: 'text-zinc-400', bgColor: 'bg-zinc-600/20' },
  pendiente: { icon: FiSquare, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  decision: { icon: FiCheckSquare, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  acuerdo: { icon: FiUsers, color: 'text-teal-400', bgColor: 'bg-teal-500/10' },
  hito: { icon: FiFlag, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  aviso: { icon: FiAlertTriangle, color: 'text-orange-400', bgColor: 'bg-orange-500/10' }
};

const EventCard = ({ event, onDeleteRequest }) => {
  const { toggleEventCompleted, projects } = useContext(AppContext);

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
    e.stopPropagation();
    onDeleteRequest(event);
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
        <div className="flex flex-col items-center gap-2 pt-0.5">
          <button 
            onClick={() => toggleEventCompleted(event.id)} 
            className="flex-shrink-0"
            title={event.isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}
          >
            {event.isCompleted 
              // ----- CAMBIO 3: Usar el nuevo icono FiCheckCircle -----
              ? <FiCheckCircle className="text-green-500" size={20} />
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

          {/* ----- CAMBIO 4: Contenedor para la etiqueta de tipo y el contexto ----- */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Etiqueta de Tipo de Evento */}
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${style.color} ${style.bgColor}`}>
              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </span>

            {/* Información de contexto (Proyecto/Tarea) */}
            {contextInfo && (
              <div className="text-[11px] text-zinc-500">
                <span>{contextInfo.projectName}</span>
                {contextInfo.taskName && <span> {' > '} {contextInfo.taskName}</span>}
              </div>
            )}
          </div>
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