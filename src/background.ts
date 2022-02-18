// @ts-nocheck
"use strict";

import { app, BrowserWindow, ipcMain, ipcRenderer, Menu, nativeImage, Notification, protocol, Tray } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import * as path from "path";
import ElectronStore from "electron-store";
import { MyLogger } from "@/base/utils/MyLogger";
import { registerShortcut } from "@/electron/shortcutHandler";

const isDevelopment = process.env.NODE_ENV !== "production";
const appName = process.env.VUE_APP_Title;
const iconPath = path.join(__static, "images", "icon_logo.png");

const icon = nativeImage.createFromPath(iconPath);
const isMac = process.platform === "darwin";

let mainWindowId: any;
const tray = null;

const width = 800;
const height = 600;
const BrowserWindowMap = new Map<number, BrowserWindow>();

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { secure: true, standard: true } }]);

app.on("ready", async () => {
  await setup();
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.setAppUserModelId(appName);

function baseUrl() {
  if (isDevelopment) {
    return process.env.WEBPACK_DEV_SERVER_URL as string;
  } else {
    return `app://./index.html`;
  }
}

async function setup() {
  ElectronStore.initRenderer();
  await installDevTools();
  await createWindow();
  await createTray();
  shortcut();
  ipcMainHandler();
  createNotification("測試標題", "測試副標題", "測試內容");
}

async function createWindow() {
  const mainWindowIcon = icon.resize({
    width: 64,
    height: 64,
  });

  const browserWindow = new BrowserWindow({
    width: width,
    height: height,
    minWidth: width,
    minHeight: height,
    icon: mainWindowIcon,
    frame: false,
    show: true,
    webPreferences: {
      // devTools: false,
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION as unknown as boolean,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, "preload.js"), // 指定preload.js脚本
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    if (!process.env.IS_TEST) {
      browserWindow.webContents.openDevTools();
    }
  } else {
    createProtocol("app");
  }

  await browserWindow.loadURL(baseUrl());
  browserWindow.setMenu(null);

  BrowserWindowMap.set(browserWindow.id, browserWindow);
  mainWindowId = browserWindow.id;
}

async function createTray() {
  // TODO:建立托盤
}

function showMainWindow() {
  BrowserWindowMap.get(mainWindowId).show();
  setTrayMenu();
}

function hideMainWindow() {
  BrowserWindowMap.get(mainWindowId).hide();
  setTrayMenu();
}

function exitMainWindow() {
  app.quit();
}

function setTrayMenu() {
  // TODO:更新托盤菜單
}

function createNotification(title: string, subTitle: string, contnet: string) {
  // TODO: 建立通知
}

function shortcut() {
  // TODO: 註冊全域快捷鍵
}

async function installDevTools() {
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      MyLogger.log("Vue開發插件安裝失敗", e.toString());
    }
  }
}

function ipcMainHandler() {
  ipcMain.on("minimize", () => {
    //TODO: 最小化
  });

  ipcMain.on("maximize", () => {
    //TODO: 最大化
  });

  ipcMain.on("closeHide", () => {
    //TODO: 關閉或隱藏
  });

  ipcMain.on("fullScreen", () => {
    //TODO: 全螢幕
  });

  ipcMain.on("currentUrl", (event, url: string) => {
    MyLogger.log("輸出", url);
  });
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
