import { ref, readonly } from 'vue'

// 录屏状态管理器
class RecordingStore {
  private _isRecording = ref(false)
  private _recordingStartTime = ref<number | null>(null)
  private _recordingDuration = ref(0)

  // 只读状态，外部组件可以监听但不能直接修改
  readonly isRecording = readonly(this._isRecording)
  readonly recordingStartTime = readonly(this._recordingStartTime)
  readonly recordingDuration = readonly(this._recordingDuration)

  // 开始录屏
  startRecording() {
    this._isRecording.value = true
    this._recordingStartTime.value = Date.now()
    this._recordingDuration.value = 0
    
    // 开始计时
    this._startTimer()
    
    console.log('录屏状态：开始录屏')
  }

  // 停止录屏
  stopRecording() {
    this._isRecording.value = false
    this._recordingStartTime.value = null
    this._recordingDuration.value = 0
    
    // 停止计时
    this._stopTimer()
    
    console.log('录屏状态：停止录屏')
  }

  // 获取录屏时长（秒）
  getRecordingDuration(): number {
    if (!this._isRecording.value || !this._recordingStartTime.value) {
      return 0
    }
    return Math.floor((Date.now() - this._recordingStartTime.value) / 1000)
  }

  // 格式化录屏时长
  formatRecordingTime(): string {
    const duration = this.getRecordingDuration()
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  private _timer: ReturnType<typeof setInterval> | null = null

  private _startTimer() {
    this._stopTimer() // 确保之前的计时器被清除
    
    this._timer = setInterval(() => {
      if (this._isRecording.value && this._recordingStartTime.value) {
        this._recordingDuration.value = this.getRecordingDuration()
      }
    }, 1000)
  }

  private _stopTimer() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
  }

  // 清理资源
  dispose() {
    this._stopTimer()
  }
}

// 创建全局单例
export const recordingStore = new RecordingStore()

// 在组件卸载时清理资源
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    recordingStore.dispose()
  })
}

export default recordingStore
