const { app, BrowserWindow } = require('electron');

function createWindow() {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false
  });

  win.maximize();

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);