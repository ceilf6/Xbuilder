interface IframeWindow extends Window {
  startRecording?: () => void
  stopRecording?: () => Promise<Blob> // stopRecording 直接返回 Blob
  getScreenshot?: () => Blob | Promise<Blob>
  pauseGame?: () => void
  resumeGame?: () => void
  dispatchKeyToEvent?: (type: string, code: string)=>void
}

const iframeRef = ref<HTMLIFrameElement>()
const iframeWindowRef = ref<IframeWindow | null>(null)

defineExpose({
  async pauseGame() {
    const iframe = iframeRef.value
    if (!iframe) return
    const win = iframe.contentWindow as IframeWindow
    if (win && typeof win.pauseGame === 'function') {
      return win.pauseGame()
    }
  },
  async resumeGame() {
    const iframe = iframeRef.value
    if (!iframe) return
    const win = iframe.contentWindow as IframeWindow
    if (win && typeof win.resumeGame === 'function') {
      return win.resumeGame()
    }
  },
  async getScreenshot() {
    const iframe = iframeRef.value
    if (!iframe) return
    const win = iframe.contentWindow as IframeWindow
    if (win && typeof win.getScreenshot === 'function') {
      return win.getScreenshot()
    }
  },
  async startRecording() {
    const iframe = iframeRef.value
    if (!iframe) return
    const win = iframe.contentWindow as IframeWindow
    if (win && typeof win.startRecording === 'function') {
      return win.startRecording()
    }
  },
  async stopRecording() {
    const iframe = iframeRef.value
    if (!iframe) return
    const win = iframe.contentWindow as IframeWindow
    if (win && typeof win.stopRecording === 'function') {
      return win.stopRecording()
    }
  },
  async dispatchKeyToEvent(type: string, code: string){
    const iframe = iframeRef.value
    if (!iframe) return
    const win = iframe.contentWindow as IframeWindow
    if (win && typeof win.dispatchKeyToEvent === 'function') {
      return win.dispatchKeyToEvent(type, code)
    }
  }
})