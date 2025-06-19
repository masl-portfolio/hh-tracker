import React from 'react';
import { FiUser, FiFolder, FiPlus, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; // Asegúrate de tener react-router-dom

const ProfileSelectorView = ({ profiles }) => {
  const navigate = useNavigate();

  const handleSelectProfile = (profileId) => {
    window.electronAPI.setActiveProfile(profileId);
    // La app se recargará desde el proceso principal
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white font-sans p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-2">Selecciona un Perfil</h1>
        <p className="text-slate-400 text-center mb-10">Elige con qué espacio de trabajo quieres continuar.</p>

        <div className="space-y-4 mb-8">
          {profiles.map(profile => (
            <button 
              key={profile.id} 
              onClick={() => handleSelectProfile(profile.id)}
              className="w-full flex items-center justify-between text-left p-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all duration-200 hover:border-blue-500 group"
            >
              <div>
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <div className="flex items-center gap-6 mt-2 text-sm text-slate-400">
                    <span className="flex items-center gap-2"><FiUser /> {profile.username}</span>
                    <span className="flex items-center gap-2 truncate"><FiFolder /> {profile.dataPath}</span>
                </div>
              </div>
              <FiArrowRight className="text-slate-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-1" size={24}/>
            </button>
          ))}
        </div>
        
        <div className="text-center">
             <button onClick={() => navigate('/onboarding')} className="flex items-center justify-center gap-2 mx-auto bg-transparent border border-dashed border-slate-600 hover:border-slate-500 text-slate-400 hover:text-white px-6 py-3 rounded-lg transition-colors">
                <FiPlus/> Crear un Nuevo Perfil
             </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelectorView;