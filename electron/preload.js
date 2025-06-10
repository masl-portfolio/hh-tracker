const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  openProyectos: () => ipcRenderer.send('abrir-proyectos'),
})
