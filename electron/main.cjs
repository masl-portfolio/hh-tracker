const { app, BrowserWindow, ipcMain, screen } = require('electron')
const path = require('path')

app.disableHardwareAcceleration()

let mainWin

function createMainWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  mainWin = new BrowserWindow({
    width: 360,
    height: 280,
    x: width - 380,
    y: 40,
    resizable: false,
    frame: false,
    alwaysOnTop: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  const devUrl = process.env.VITE_DEV_SERVER_URL

  if (devUrl) {
    const tryLoad = () => {
      fetch(devUrl)
        .then(() => mainWin.loadURL(devUrl))
        .catch(() => setTimeout(tryLoad, 300))
    }
    tryLoad()
  } else {
    mainWin.loadFile(path.join(__dirname, 'dist/index.html'))
  }
}

function openProyectosWindow() {
  const proyectosWin = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  const devUrl = process.env.VITE_DEV_SERVER_URL

  if (devUrl) {
    proyectosWin.loadURL(`${devUrl}#/proyectos`)
  } else {
    proyectosWin.loadFile(path.join(__dirname, 'dist/index.html'), {
      hash: 'proyectos',
    })
  }
}

// Eventos IPC
ipcMain.on('minimize-window', () => {
  if (mainWin) mainWin.minimize()
})

ipcMain.on('abrir-proyectos', () => {
  openProyectosWindow()
})

// Iniciar
app.whenReady().then(createMainWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
