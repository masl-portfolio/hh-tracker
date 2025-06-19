import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiFolder, FiArrowRight, FiArrowLeft, FiPower, FiUploadCloud } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

const OnboardingView = () => {
  const [profileName, setProfileName] = useState('');
  const [username, setUsername] = useState('');
  const [dataPath, setDataPath] = useState('');
  const [error, setError] = useState('');
  const [hasExistingProfiles, setHasExistingProfiles] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkForProfiles = async () => {
      const config = await window.electronAPI.getConfig();
      if (config && config.profiles && config.profiles.length > 0) {
        setHasExistingProfiles(true);
      }
    };
    checkForProfiles();
  }, []);

  const handleSelectPath = async () => {
    setError('');
    if (!profileName.trim()) {
      setError('Por favor, ingresa primero un nombre para el perfil.');
      return;
    }
    const path = await window.electronAPI.selectDataPath(profileName);
    if (path) {
      setDataPath(path);
    }
  };

  const handleRestoreProfile = async () => {
    setError('');
    const filePath = await window.electronAPI.restoreProfilePath();
    if (filePath) {
      const fileName = filePath.split(/[\\/]/).pop();
      const suggestedName = fileName
        .replace(/\.json$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      setProfileName(suggestedName);
      setDataPath(filePath);
      setUsername('');
      toast.success('Archivo seleccionado. Completa tu nombre y comienza.');
    }
  };

  const handleStart = async () => {
    if (!profileName.trim() || !username.trim() || !dataPath) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    const newProfile = {
      id: uuidv4(),
      name: profileName,
      username: username,
      dataPath: dataPath,
    };
    await window.electronAPI.saveNewProfile(newProfile);
  };

  const handleExitApp = () => {
    window.electronAPI.closeApp();
  };

  // ----- CAMBIO CLAVE: Lógica de cambio de nombre simplificada y corregida -----
  // Ahora, esta función SÓLO actualiza el nombre del perfil en el estado.
  const handleProfileNameChange = (e) => {
    setProfileName(e.target.value);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white font-sans p-4">
      <div className="w-full max-w-lg">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl relative">
          
          {hasExistingProfiles && (
            <button 
              onClick={() => navigate(-1)} 
              className="absolute top-6 left-6 flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <FiArrowLeft /> Volver
            </button>
          )}

          <div className="text-center pt-8">
            <h1 className="text-3xl font-bold">¡Bienvenido a HH Tracker!</h1>
            <p className="text-slate-400 mt-2 mb-6">Comencemos por configurar tu primer perfil.</p>
          </div>
          
          <div className="text-center mb-6">
            <button 
              onClick={handleRestoreProfile}
              className="flex items-center gap-2 mx-auto text-sm text-orange-400 hover:text-orange-300 font-semibold transition-colors"
            >
              <FiUploadCloud />
              ¿Ya tienes un archivo de datos? Restáuralo aquí.
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Nombre del Perfil</label>
              <input 
                type="text"
                placeholder='Ej: "Trabajo", "Proyectos Personales"'
                value={profileName}
                onChange={handleProfileNameChange} // Usar el nuevo manejador simplificado
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Tu Nombre</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="¿Cómo te llamas?"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Archivo de Datos</label>
              <div className="flex items-center gap-3">
                <div className="relative flex-grow">
                   <FiFolder className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                      type="text"
                      readOnly
                      value={dataPath || "Crea un perfil nuevo o restaura uno..."}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 pl-10 text-slate-400 text-sm truncate"
                   />
                </div>
                <button 
                  onClick={handleSelectPath} 
                  // El botón "Seleccionar" ahora solo se deshabilita si ya se ha restaurado una ruta
                  // y el usuario NO ha intentado crear un perfil nuevo a partir de ella.
                  // En la práctica, con la nueva lógica, esto ya no es necesario, pero lo dejamos por claridad.
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-semibold transition-colors"
                  title={'Seleccionar ubicación para guardar un perfil nuevo'}
                >
                  Seleccionar
                </button>
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center mt-6">{error}</p>}
          
          <button
            onClick={handleStart}
            disabled={!profileName || !username || !dataPath}
            className="w-full flex items-center justify-center gap-3 mt-8 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg p-4 font-bold text-lg transition-colors"
          >
            Comenzar a Trakear <FiArrowRight/>
          </button>
        </div>

        <div className="text-center mt-6">
          <button 
            onClick={handleExitApp}
            className="flex items-center gap-2 mx-auto text-sm text-red-600 hover:text-red-500 font-medium transition-colors"
          >
            <FiPower size={14} /> Salir de la aplicación
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingView;