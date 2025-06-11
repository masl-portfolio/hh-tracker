const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

app.disableHardwareAcceleration();

let mainWin;

function createMainWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWin = new BrowserWindow({
    width: 360,
    height: 360, // Aumenté un poco la altura para el nuevo diseño del widget
    x: width - 380,
    y: 40,
    resizable: false,
    frame: false,
    alwaysOnTop: false,
    transparent: true, // Para que los bordes redondeados se vean bien en el widget
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;

  if (devUrl) {
    mainWin.loadURL(devUrl);
  } else {
    mainWin.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function openProyectosWindow() {
  const proyectosWin = new BrowserWindow({
    width: 900, // Un poco más ancho para la comodidad
    height: 700,
    autoHideMenuBar: true,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;

  if (devUrl) {
    proyectosWin.loadURL(`${devUrl}#/proyectos`);
  } else {
    proyectosWin.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: 'proyectos',
    });
  }
}

// --- Eventos IPC ---

ipcMain.on('minimize-window', () => {
  if (mainWin) mainWin.minimize();
});

// Corregí el nombre del evento para que coincida con el preload.js
ipcMain.on('open-proyectos', () => {
  openProyectosWindow();
});

// --- NUEVO EVENTO AÑADIDO ---
// Escucha la señal 'close-app' enviada desde cualquier ventana
// a través del preload y cierra la aplicación completamente.
ipcMain.on('close-app', () => {
  app.quit();
});


// --- Ciclo de vida de la aplicación ---

app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});