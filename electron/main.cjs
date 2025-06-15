// electron/main.js (COMPLETO Y FINAL)

const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

app.disableHardwareAcceleration();

let mainWin;
let proyectosWin;

// Ancho fijo para la ventana del widget. Puedes ajustarlo si lo necesitas.
const WINDOW_WIDTH = 480;

function createMainWindow() {
  // --- CORRECCIÓN CLAVE ---
  // 1. Obtenemos el tamaño del "área de trabajo", que ya excluye la barra de tareas.
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWin = new BrowserWindow({
    width: WINDOW_WIDTH,

    // 2. La altura de la ventana es ahora exactamente la altura del área de trabajo.
    height: screenHeight,
    
    // 3. La posición 'x' la ancla a la derecha.
    x: screenWidth - WINDOW_WIDTH - 20, // 20px de margen derecho.

    // 4. La posición 'y' es 0 para que empiece en el borde superior del área de trabajo.
    y: 0, 

    resizable: false, // Recomendado para que el usuario no pueda cambiar el tamaño.
    frame: false,
    alwaysOnTop: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWin.on('closed', () => {
    mainWin = null;
    app.quit();
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    mainWin.loadURL(devUrl);
  } else {
    mainWin.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function openProyectosWindow() {
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
  proyectosWin.on('closed', () => { proyectosWin = null; });
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    proyectosWin.loadURL(`${devUrl}#/proyectos`);
  } else {
    proyectosWin.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'proyectos' });
  }
}

// --- Eventos IPC (Inter-Process Communication) ---

// El manejador 'set-window-height' que teníamos antes ya no es necesario
// porque la ventana ahora tiene una altura fija al 100% del área de trabajo.

// Manejadores existentes que no cambian
ipcMain.on('minimize-window', () => { if (mainWin) mainWin.minimize(); });
ipcMain.on('open-proyectos', openProyectosWindow);
ipcMain.on('close-app', () => { app.quit(); });


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