const { app, BrowserWindow } = require("electron");
const path = require("path");

const servicesPath = path.join(__dirname, "electron/dist");

const tasksIPC = require(path.join(servicesPath, "ipc/tasks.ipc.js"));
const graphIPC = require(path.join(servicesPath, "ipc/graph.ipc.js"));

tasksIPC.registerTaskIPC();
graphIPC.registerGraphIPC();

let mainWindow;
let isDev =true;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "electron/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const indexPath = path.join(__dirname, "client/dist/index.html");

mainWindow.webContents.openDevTools();
  if (isDev) {
    mainWindow.loadURL("http://localhost:6080");
  } else {
    mainWindow.loadFile(indexPath);
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

// 👇 export window getter for IPC files
module.exports.getMainWindow = () => mainWindow;