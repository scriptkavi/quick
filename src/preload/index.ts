/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
export type QuickApiType = {
  startServer: () => any
  onServerStart: (callback: (value: any) => void) => void
  closeServer: () => any
  onServerStop: (callback: (value: any) => void) => void
  onServerError: (callback: (value: any) => void) => void
  onServerMessage: (callback: (value: any) => void) => void
}
const QuickApi: QuickApiType = {
  startServer: () => electronAPI.ipcRenderer.send('startServer'),
  onServerStart: (callback) =>
    electronAPI.ipcRenderer.on('serverStart', (_event, value) => callback(value)),
  closeServer: () => electronAPI.ipcRenderer.send('closeServer'),
  onServerStop: (callback) =>
    electronAPI.ipcRenderer.on('serverStop', (_event, value) => callback(value)),
  onServerError: (callback) =>
    electronAPI.ipcRenderer.on('serverError', (_event, value) => callback(value)),
  onServerMessage: (callback) =>
    electronAPI.ipcRenderer.on('serverMessage', (_event, value) => callback(value))
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('quickapi', QuickApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
