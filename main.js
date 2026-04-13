import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

// __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const servicesPath = path.join(__dirname, "electron/dist");

// dynamic imports for local files
const tasksIPC = await import(path.join(servicesPath, "ipc/tasks.ipc.js"));
const graphIPC = await import(path.join(servicesPath, "ipc/graph.ipc.js"));

tasksIPC.registerTaskIPC();
graphIPC.registerGraphIPC();

let mainWindow;
const isDev = true;

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

// export
export function getMainWindow() {
  return mainWindow;
}