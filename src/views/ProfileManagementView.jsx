import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiPlus, FiArrowLeft, FiCheckCircle, FiUser, FiFolder, 
  FiTrash2, FiRotateCcw, FiEye, FiEyeOff // <-- Importar los nuevos iconos
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ProfileManagementView = () => {
  const [profiles, setProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // ----- CAMBIO 1: Estado para el nuevo filtro de visibilidad -----
  const [showArchived, setShowArchived] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConfig = async () => {
      const config = await window.electronAPI.getConfig();
      if (config) {
        const profilesWithStatus = (config.profiles || []).map(p => ({ ...p, status: p.status || 'active' }));
        setProfiles(profilesWithStatus);
        setActiveProfileId(config.lastUsedProfile);
      }
      setIsLoading(false);
    };
    fetchConfig();
  }, []);

  const handleSelectProfile = (profile) => {
    if (profile.status === 'archived') {
      toast.error('No se puede seleccionar un perfil archivado. Restáuralo primero.');
      return;
    }
    if (profile.id !== activeProfileId) {
      window.electronAPI.setActiveProfile(profile.id);
    }
  };

  const handleCreateProfile = () => navigate('/onboarding');

  const handleToggleArchive = async (e, profile) => {
    e.stopPropagation();
    const newStatus = profile.status === 'archived' ? 'active' : 'archived';
    const actionText = newStatus === 'active' ? 'restaurado' : 'archivado';

    const result = await window.electronAPI.updateProfileStatus(profile.id, newStatus);
    if (result.success) {
      setProfiles(currentProfiles =>
        currentProfiles.map(p => p.id === profile.id ? { ...p, status: newStatus } : p)
      );
      toast.success(`Perfil "${profile.name}" ${actionText}.`);
    } else {
      toast.error(`No se pudo archivar el perfil: ${result.error}`);
    }
  };

  // ----- CAMBIO 2: Lógica de filtrado actualizada -----
  const filteredProfiles = useMemo(() => {
    if (showArchived) {
      // Ordenar para que los activos aparezcan primero
      return [...profiles].sort((a, b) => {
        if (a.status === 'archived' && b.status !== 'archived') return 1;
        if (a.status !== 'archived' && b.status === 'archived') return -1;
        return 0;
      });
    }
    return profiles.filter(p => p.status !== 'archived');
  }, [profiles, showArchived]);

  if (isLoading) {
    return <div className="h-full w-full flex items-center justify-center text-slate-400">Cargando perfiles...</div>;
  }

  return (
    <div className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8 font-sans animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-400 hover:text-blue-500 transition-colors mb-8">
          <FiArrowLeft /> Volver
        </button>
        
        <div className="text-center mb-6">
          <FiUsers className="mx-auto text-slate-500 mb-4" size={48} />
          <h1 className="text-4xl font-bold text-white tracking-tighter">Gestionar Perfiles</h1>
          <p className="text-slate-400 mt-2">Cambia de espacio de trabajo o crea uno nuevo.</p>
        </div>

        {/* ----- CAMBIO 3: Reemplazar los botones de filtro por el nuevo conmutador ----- */}
        <div className="flex justify-end mb-4">
            <button 
              onClick={() => setShowArchived(!showArchived)} 
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
                {showArchived ? <FiEyeOff /> : <FiEye />}
                <span>{showArchived ? 'Ocultar archivados' : 'Mostrar archivados'}</span>
            </button>
        </div>

        <div className="space-y-4">
          {filteredProfiles.map(profile => {
            const isActive = profile.id === activeProfileId;
            const isArchived = profile.status === 'archived';
            return (
              <div 
                key={profile.id} 
                onClick={() => handleSelectProfile(profile)}
                className={`w-full flex items-center justify-between text-left p-5 border rounded-xl transition-all duration-200 
                  ${isActive && !isArchived ? 'bg-blue-500/10 border-blue-500 shadow-lg' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}
                  ${isArchived ? 'opacity-50' : 'cursor-pointer'}
                `}
              >
                <div className="flex-grow min-w-0">
                  <h2 className={`text-xl font-bold ${isActive && !isArchived ? 'text-white' : 'text-slate-200'}`}>{profile.name}</h2>
                  <div className="flex items-center gap-6 mt-2 text-sm text-slate-400">
                      <span className="flex items-center gap-2"><FiUser /> {profile.username}</span>
                      <span className="flex items-center gap-2 truncate" title={profile.dataPath}><FiFolder /> ...{profile.dataPath.slice(-30)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <button onClick={(e) => handleToggleArchive(e, profile)} className={`p-2 rounded-full transition-colors ${isArchived ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-slate-500 hover:text-red-500 hover:bg-red-500/10'}`} title={isArchived ? 'Restaurar perfil' : 'Archivar perfil'}>
                    {isArchived ? <FiRotateCcw size={18} /> : <FiTrash2 size={18} />}
                  </button>
                  {isActive && !isArchived && <FiCheckCircle className="text-blue-400" size={24}/>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
             <button onClick={handleCreateProfile} className="flex items-center justify-center gap-2 mx-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                <FiPlus/> Crear Nuevo Perfil
             </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagementView;