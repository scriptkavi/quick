/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// import Versions from './components/Versions'
import { useEffect, useState } from 'react'
import dragIcon from './assets/drag.svg'
import QrCode from './components/qr-code'

function App(): JSX.Element {
  const [serverStarted, setServerStarted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState('Start your server and start sharing files')
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  useEffect(() => {
    if (url) {
      const urlobject = new URL(url)
      const qrurl = `${url}/qr_codes/${urlobject.hostname}_${urlobject.port}.png`
      setQrCodeUrl(qrurl)
    } else {
      setQrCodeUrl('')
    }
  }, [url])

  useEffect(() => {
    window.quickapi.onServerStart((value) => {
      setServerStarted(true)
      setMessage(value.text)
      setUrl(new TextDecoder().decode(value.url))
    })

    window.quickapi.onServerStop((value) => {
      setServerStarted(false)
      setMessage(value.text)
      setUrl('')
    })

    window.quickapi.onServerError((value) => {
      setServerStarted(false)
      setErrorMsg(value.text)
      setUrl('')
    })

    window.quickapi.onServerMessage((value) => {
      if (value.status === 'success') {
        setMessage(value.text)
      } else {
        setErrorMsg(value.text)
      }
    })
  }, [])

  const startServer = () => {
    window.quickapi.startServer()
  }

  const closeServer = () => {
    window.quickapi.closeServer()
  }

  return (
    <>
      <div className="drag-region">
        <img alt="logo" className="logo" src={dragIcon} />
      </div>

      <div className="logo">Quick</div>
      <div className="creator">Powered by Opensource Community</div>
      <div className="text">Share files across devices in the same network</div>
      <p className="tip">{message}</p>
      {url ? <p className="tip">{url}</p> : null}
      <div className="qrcode">
        {/* <img src={qrCodeUrl} /> */}
        {url ? <QrCode url={url} /> : null}
      </div>
      <div className="actions">
        <div className="action">
          {serverStarted ? (
            <a target="_blank" rel="noreferrer" className="destructive" onClick={closeServer}>
              Stop Server
            </a>
          ) : (
            <a target="_blank" rel="noreferrer" onClick={startServer}>
              Start Server
            </a>
          )}
        </div>
      </div>
      <ul className="versions">
        <li className="electron-version">Crafted by ScriptKavi</li>
      </ul>
    </>
  )
}

export default App
