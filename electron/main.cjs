const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs/promises');

// --- LÓGICA ORIGINAL RESTAURADA ---
app.disableHardwareAcceleration();

const WIDGET_WIDTH = 580;
const WIDGET_HEIGHT = 880;
// ------------------------------------

// --- LÓGICA MEJORADA: Clase Store para manejar archivos ---
class Store {
  constructor(filePath) { this.path = filePath; }
  async read() { try { await fs.access(this.path); const data = await fs.readFile(this.path, { encoding: 'utf8' }); return JSON.parse(data); } catch (error) { console.log(`No se pudo leer el archivo en ${this.path}.`); return null; } }
  async write(data) { await fs.mkdir(path.dirname(this.path), { recursive: true }); await fs.writeFile(this.path, JSON.stringify(data, null, 2)); }
}

const configPath = path.join(app.getPath('userData'), 'hh-tracker-config.json');
const configStore = new Store(configPath);
let mainWindow = null;

async function createWindow() {
  if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); return; }

  // --- LÓGICA ORIGINAL RESTAURADA: Configuración de ventana ---
  mainWindow = new BrowserWindow({
    width: WIDGET_WIDTH,
    height: WIDGET_HEIGHT,
    minWidth: 800,
    minHeight: 800,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  // -----------------------------------------------------------

  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
  const prodPath = path.join(__dirname, '../dist/index.html');

  const config = await configStore.read();
  const initialPath = (config && config.profiles && config.profiles.length > 0) ? '/' : '/onboarding';
  const initialUrl = process.env.NODE_ENV === 'production' ? `file://${prodPath}#${initialPath}` : `${devUrl}#${initialPath}`;
  mainWindow.loadURL(initialUrl);

  if (process.env.NODE_ENV !== 'production') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('maximize', () => mainWindow.webContents.send('window-maximized-state-changed', true));
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window-maximized-state-changed', false));
  mainWindow.on('closed', () => { mainWindow = null; });
}

// --- LÓGICA ORIGINAL RESTAURADA: Bloqueo de instancia única ---
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) { app.quit(); } else { app.on('second-instance', () => { if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); } }); app.whenReady().then(createWindow); }
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
// -------------------------------------------------------------

// --- MANEJADORES DE IPC (Fusión de lógica original y nueva) ---
ipcMain.handle('get-config', () => configStore.read());
ipcMain.handle('select-data-path', async (event, profileName) => { const { filePath } = await dialog.showSaveDialog(mainWindow, { title: 'Seleccionar ubicación para los datos', defaultPath: path.join(app.getPath('documents'), `${profileName}-data.json`), buttonLabel: 'Guardar archivo de datos', filters: [{ name: 'JSON Files', extensions: ['json'] }] }); return filePath; });
ipcMain.handle('restore-profile-path', async () => { const { filePaths } = await dialog.showOpenDialog(mainWindow, { title: 'Seleccionar archivo de datos para restaurar', properties: ['openFile'], filters: [{ name: 'Archivos JSON', extensions: ['json'] }] }); return filePaths && filePaths.length > 0 ? filePaths[0] : null; });

ipcMain.handle('save-new-profile', async (event, profileData) => {
  const { id, name, username, dataPath } = profileData;
  let config = await configStore.read() || { profiles: [], lastUsedProfile: null };
  config.profiles.push({ id, name, username, dataPath, status: 'active' });
  config.lastUsedProfile = id;
  await configStore.write(config);
  try { await fs.access(dataPath); } catch (error) { const dataStore = new Store(dataPath); await dataStore.write({ projects: [], events: [], activeTask: null }); }
  const reloadUrl = process.env.NODE_ENV === 'production' ? `file://${path.join(__dirname, '../dist/index.html')}` : (process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173');
  mainWindow.loadURL(reloadUrl);
});

ipcMain.handle('update-profile-status', async (event, { profileId, status }) => {
  let config = await configStore.read();
  if (config && config.profiles) {
    const profileIndex = config.profiles.findIndex(p => p.id === profileId);
    if (profileIndex > -1) {
      config.profiles[profileIndex].status = status;
      if (status === 'archived' && config.lastUsedProfile === profileId) { config.lastUsedProfile = null; }
      await configStore.write(config);
      return { success: true };
    }
  }
  return { success: false, error: 'Perfil no encontrado' };
});

ipcMain.handle('set-active-profile', async (event, profileId) => { let config = await configStore.read(); if (config) { config.lastUsedProfile = profileId; await configStore.write(config); const reloadUrl = process.env.NODE_ENV === 'production' ? `file://${path.join(__dirname, '../dist/index.html')}` : (process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'); mainWindow.loadURL(reloadUrl); } });
ipcMain.handle('load-data', async (event, dataPath) => { const dataStore = new Store(dataPath); return await dataStore.read() || { projects: [], events: [], activeTask: null }; });
ipcMain.handle('save-data', async (event, dataPath, data) => { try { const dataStore = new Store(dataPath); await dataStore.write(data); return { success: true }; } catch (error) { console.error('Error al guardar datos:', error); return { success: false, error: error.message }; } });

// --- LÓGICA ORIGINAL RESTAURADA: Controles de ventana ---
ipcMain.on('maximize-window', () => mainWindow?.maximize());
ipcMain.on('restore-window', () => {
  if (mainWindow) {
    mainWindow.unmaximize();
    mainWindow.setSize(WIDGET_WIDTH, WIDGET_HEIGHT, true);
    mainWindow.center();
  }
});
ipcMain.on('minimize-app', () => mainWindow?.minimize());
ipcMain.on('close-app', () => app.quit());
ipcMain.on('open-view', (event, viewName) => console.log(`Vista cambiada a: ${viewName}`));
// -------------------------------------------------------------