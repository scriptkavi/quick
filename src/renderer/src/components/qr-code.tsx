/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable prettier/prettier */
import * as React from 'react'
import qrIcon from '../assets/qricon.png'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'qr-code': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }

  interface HTMLElement {
    animateQRCode: (animationType: string) => void
  }
}

const QrCode = ({ url }: { url: string }) => {
  const qrRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    if (qrRef.current) {
      qrRef.current.addEventListener('codeRendered', () => {
        qrRef.current?.animateQRCode('MaterializeIn')
      })
    }
  }, [qrRef.current])

  if (!url) {
    return null
  }

  return (
    <qr-code
      ref={qrRef}
      id="qr1"
      contents={url}
      module-color="#078efb"
      position-ring-color="#0078D3"
      position-center-color="#1EA3E3"
      mask-x-to-y-ratio="1.2"
      style={{
        width: '200px',
        height: '200px',
        margin: '2em auto',
        backgroundColor: '#060606'
      }}
    >
      <img src={qrIcon} slot="icon" style={{ width: '2.5rem' }} />
    </qr-code>
  )
}

export default QrCode
