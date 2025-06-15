// preload.js (COMPLETO Y CORREGIDO)

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Funciones de control de ventana y app
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  openProyectos: () => ipcRenderer.send('open-proyectos'),
  closeApp: () => ipcRenderer.send('close-app'),
  
  // La función setWindowHeight ha sido eliminada.
});