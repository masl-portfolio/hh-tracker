const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

// Deshabilitar la aceleración por hardware puede ayudar en algunos entornos, mantenemos la línea.
app.disableHardwareAcceleration();

let mainWin; // Ventana principal (Widget/Dashboard)
let proyectosWin; // Ventana secundaria para la gestión de proyectos

function createMainWindow() {
  const { width } = screen.getPrimaryDisplay().workAreaSize;

  mainWin = new BrowserWindow({
    width: 400, // Un poco más ancho para el layout de 3 columnas
    height: 768, // Altura aumentada significativamente para el dashboard
    x: width - 420, // Ajustado al nuevo ancho
    y: 40,
    resizable: true, // Permitir redimensionar puede ser útil para el dashboard
    frame: false,
    alwaysOnTop: false,
    transparent: true, // Mantenemos la transparencia para el diseño sin marco
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Asegurarse de que al cerrar la ventana principal, se cierre la app
  mainWin.on('closed', () => {
    mainWin = null;
    app.quit();
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;

  if (devUrl) {
    mainWin.loadURL(devUrl);
    // Opcional: abrir las herramientas de desarrollo para la ventana principal
    // mainWin.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWin.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function openProyectosWindow() {
  // Si la ventana ya existe, simplemente la enfocamos.
  if (proyectosWin && !proyectosWin.isDestroyed()) {
    proyectosWin.focus();
    return;
  }

  proyectosWin = new BrowserWindow({
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Limpiar la referencia cuando la ventana se cierra
  proyectosWin.on('closed', () => {
    proyectosWin = null;
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

// --- Eventos IPC (Inter-Process Communication) ---

ipcMain.on('minimize-window', () => {
  if (mainWin) mainWin.minimize();
});

ipcMain.on('open-proyectos', () => {
  openProyectosWindow();
});

ipcMain.on('close-app', () => {
  app.quit();
});


// --- Ciclo de vida de la aplicación ---

app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
  // En macOS es común que la aplicación se mantenga activa
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // En macOS, re-crear la ventana si se hace clic en el ícono del dock y no hay otras ventanas abiertas.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});