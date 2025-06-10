import React from 'react';
import { FiTrash2, FiMessageSquare } from 'react-icons/fi';
import AppContext from '../context/AppContext';

const HistorialActividades = ({ projectId, taskId, activities }) => {
  const { deleteActivity } = React.useContext(AppContext);

  const formatDuration = (ms) => {
    if (!ms || ms < 0) return '0h 0m 0s';
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-2">
      {activities && activities.length > 0 ? (
        [...activities].reverse().map(act => (
          <div key={act.id} className="bg-zinc-900/70 p-3 rounded-lg text-xs">
            <div className="flex justify-between items-center">
              <div className="text-zinc-300">
                <p>{act.description}</p>
                <p className="text-zinc-500">{new Date(act.fechaInicio).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-zinc-100">{formatDuration(act.fechaFin - act.fechaInicio)}</span>
                <button onClick={() => deleteActivity(projectId, taskId, act.id)} className="text-zinc-500 hover:text-red-500"><FiTrash2/></button>
              </div>
            </div>
            
            {act.observation && (
              <div className="mt-2 pt-2 border-t border-zinc-700/50 flex items-start gap-2 text-zinc-400">
                <FiMessageSquare className="mt-0.5 flex-shrink-0" />
                <p className="italic whitespace-pre-wrap">{act.observation}</p>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-center text-xs text-zinc-500 py-4">No hay actividades registradas.</p>
      )}
    </div>
  );
};

export default HistorialActividades;