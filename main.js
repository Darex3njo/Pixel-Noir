const { app, BrowserWindow } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#0f172a', // Match the noir theme background
    icon: path.join(__dirname, 'icon.png'), // You would need an icon file locally
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Simplified security for this standalone game demo
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true, // Hide the standard menu bar for immersion
  });

  // In a real dev environment, you might load from localhost:
  // mainWindow.loadURL('http://localhost:5173');
  
  // For the 'built' downloadable version:
  mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});