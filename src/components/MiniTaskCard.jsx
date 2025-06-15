import React, { useContext } from 'react';
import { FiPlay } from 'react-icons/fi';
import AppContext from '../context/AppContext';

const statusStyles = {
  backlog: 'bg-gray-700 text-gray-300',
  'en desarrollo': 'bg-blue-600 text-white',
  bloqueada: 'bg-orange-500 text-white',
  completada: 'bg-green-600 text-white',
  cancelada: 'bg-red-600 text-white'
};

const MiniTaskCard = ({ projectId, task }) => {
  const { startTask, activeTask } = useContext(AppContext);

  const totalConsumedHours = (task.activities || []).reduce(
    (sum, act) => (act.fechaFin && act.fechaInicio ? sum + (act.fechaFin - act.fechaInicio) : sum),
    0
  ) / 3600000;

  const estimatedHours = task.estimatedHours || 0;
  const progressPercent = estimatedHours > 0 ? (totalConsumedHours / estimatedHours) * 100 : 0;
  const isExceeded = totalConsumedHours > estimatedHours;

  const isActive = activeTask?.taskId === task.id && activeTask?.projectId === projectId;
  const canStart = !activeTask || isActive;

  return (
    <div className="relative flex items-center justify-between bg-zinc-800/60 p-3 rounded-lg shadow hover:bg-zinc-800">
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white truncate font-medium">{task.title}</p>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusStyles[task.status] || 'bg-zinc-500 text-white'}`}>
            {task.status || 'desconocido'}
          </span>
        </div>
        <div className="text-xs text-zinc-400 mt-0.5">
          {totalConsumedHours.toFixed(1)}h / {estimatedHours}h
        </div>
        <div className="w-full bg-zinc-700 rounded-full h-1 mt-1.5">
          <div
            className={`h-1 rounded-full ${isExceeded ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          ></div>
        </div>
      </div>
      <button
        onClick={() => startTask(projectId, task.id)}
        disabled={!canStart}
        className={`ml-2 p-2 rounded-full transition-colors duration-200 
          ${canStart ? 'bg-green-500 hover:bg-green-600' : 'bg-zinc-600 cursor-not-allowed'}`}
      >
        <FiPlay size={14} className="text-white ml-0.5" />
      </button>
    </div>
  );
};

export default MiniTaskCard;
