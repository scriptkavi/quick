import { ElectronAPI } from '@electron-toolkit/preload'
import { QuickApiType } from './index'
declare global {
  interface Window {
    electron: ElectronAPI
    quickapi: QuickApiType
  }
}
