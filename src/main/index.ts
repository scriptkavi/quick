/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// import { startServer } from '../../resources/lanshare/main'
import * as path from 'node:path'
import { spawn } from 'node:child_process'
import { exec } from 'child_process'

let nodeProcess

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 750,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 20 },
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Function to run a shell command
  function runCommand(command, cwd, callback) {
    mainWindow.webContents.send('serverMessage', {
      text: 'Installing dependencies...',
      status: 'success'
    })
    const process = exec(command, { cwd })

    process.stdout?.on('data', (data) => {
      console.log(`stdout: ${data}`)
    })

    process.stderr?.on('data', (data) => {
      console.error(`stderr: ${data}`)
      mainWindow.webContents.send('serverMessage', {
        text: 'Installing dependencies failed',
        status: 'failed'
      })
    })

    process.on('close', (code) => {
      console.log(`child process exited with code ${code}`)
      mainWindow.webContents.send('serverMessage', {
        text: 'Dependencies installed successfully',
        status: 'success'
      })
      if (callback) callback()
    })
  }

  // Communication from main to browser and vice versa

  ipcMain.on('startServer', (_event) => {
    runCommand('npm install', 'resources/lanshare', () => {
      mainWindow.webContents.send('serverMessage', {
        text: 'Starting server...',
        status: 'success'
      })
      if (nodeProcess) {
        mainWindow.webContents.send('serverStart', {
          text: 'Server is already running.',
          appstatus: 'running'
        })
      }

      nodeProcess = spawn('node', ['resources/lanshare/main.js'])

      nodeProcess.stdout.on('data', (data) => {
        console.error(`data: ${data}`)
        mainWindow.webContents.send('serverStart', {
          text: 'Server started.',
          appstatus: 'running',
          url: data
        })
      })

      nodeProcess.stderr.on('data', (data) => {
        // console.error(`stderr: ${data}`)
        mainWindow.webContents.send('serverError', {
          text: 'Something went wrong.',
          appstatus: 'stopped'
        })
      })

      nodeProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`)
        nodeProcess = null
        mainWindow.webContents.send('serverStop', {
          text: 'Server stopped.',
          appstatus: 'stopped'
        })
      })
    })
  })

  ipcMain.on('closeServer', (_event) => {
    mainWindow.webContents.send('serverMessage', {
      text: 'Stopping server...',
      status: 'success'
    })
    if (nodeProcess) {
      nodeProcess.kill()
      nodeProcess = null
      mainWindow.webContents.send('serverStop', {
        text: 'Server stopped.',
        appstatus: 'stopped'
      })
    } else {
      mainWindow.webContents.send('serverStop', {
        text: 'Server is not running',
        appstatus: 'stopped'
      })
    }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = "img-src * data:";
      document.getElementsByTagName('head')[0].appendChild(meta);
    `)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (nodeProcess) {
      nodeProcess.kill()
    }
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
