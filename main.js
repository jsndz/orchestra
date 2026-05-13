import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const servicesPath = path.join(__dirname, "electron/dist");
import { pathToFileURL } from "url";
const tasksIPC = await import(
  pathToFileURL(
    path.join(servicesPath, "ipc/tasks.ipc.js")
  ).href
);

const graphIPC = await import(
  pathToFileURL(
    path.join(servicesPath, "ipc/graph.ipc.js")
  ).href
);

tasksIPC.registerTaskIPC();
graphIPC.registerGraphIPC();

let mainWindow;

const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,

    icon: path.join(__dirname, "assets/icon.png"),

    webPreferences: {
      preload: path.join(__dirname, "electron/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const indexPath = path.join(__dirname, "client/dist/index.html");

  if (isDev) {
    mainWindow.loadURL("http://localhost:6080");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(indexPath);
  }
}

app.whenReady().then(() => {
  createWindow();

  if (process.platform === "darwin") {
    app.dock.setIcon(path.join(__dirname, "assets/icon.icns"));
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

export function getMainWindow() {
  return mainWindow;
}