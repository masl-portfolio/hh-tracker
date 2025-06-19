const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // --- Gestión de Perfiles (NUEVA) ---
  getConfig: () => ipcRenderer.invoke('get-config'),
  selectDataPath: (profileName) => ipcRenderer.invoke('select-data-path', profileName),
  saveNewProfile: (profileData) => ipcRenderer.invoke('save-new-profile', profileData),
  setActiveProfile: (profileId) => ipcRenderer.invoke('set-active-profile', profileId),
  restoreProfilePath: () => ipcRenderer.invoke('restore-profile-path'),
  updateProfileStatus: (profileId, status) => ipcRenderer.invoke('update-profile-status', { profileId, status }),

  // --- Gestión de Datos (MODIFICADA) ---
  loadData: (dataPath) => ipcRenderer.invoke('load-data', dataPath),
  saveData: (dataPath, data) => ipcRenderer.invoke('save-data', dataPath, data),

  // --- Funciones de control de ventana (ORIGINALES RESTAURADAS) ---
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  restoreWindow: () => ipcRenderer.send('restore-window'),
  minimizeWindow: () => ipcRenderer.send('minimize-app'),
  closeApp: () => ipcRenderer.send('close-app'),
  
  // --- Listeners del Main al Renderer (ORIGINALES RESTAURADOS) ---
  onDataUpdated: (callback) => ipcRenderer.on('data-updated-externally', (_event, ...args) => callback(...args)),
  onWindowMaximizedStateChanged: (callback) => {
    const subscription = (_event, isMaximized) => callback(isMaximized);
    ipcRenderer.on('window-maximized-state-changed', subscription);
    return () => ipcRenderer.removeListener('window-maximized-state-changed', subscription);
  },
  
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// --- LÓGICA ORIGINAL RESTAURADA: Alias para compatibilidad ---
contextBridge.exposeInMainWorld('electron', {
  minimizeWindow: () => ipcRenderer.send('minimize-app'),
  closeApp: () => ipcRenderer.send('close-app'),
  // Nota: Las funciones openView ya no son necesarias porque la navegación
  // ahora es manejada por React Router, que es una solución más robusta.
});
// -------------------------------------------------------------