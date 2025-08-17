<template>
  <iframe ref="iframe" class="iframe" frameborder="0" src="about:blank" />
</template>

<script lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { timeout } from '@/utils/utils'
import { addPrefetchLink } from '@/utils/dom'
import { ProgressCollector, type Progress } from '@/utils/progress'
import wasmExecUrl from '@/assets/wasm/wasm_exec.js?url'
import ispxWasmUrl from '@/assets/wasm/ispx.wasm?url'
import ispxRunnerHtml from './ispx/runner.html?raw'
import { apiBaseUrl } from '@/utils/env'
import { ensureAccessToken } from '@/stores/user'
import { recordingStore } from '@/stores/recording'

// preload resources (for example, wasm files) to accelerate the loading
export function preload() {
  // Use `<link rel=prefetch>` instead of `<link rel=preload>`:
  // * `preload` indicates higher priority than `prefetch`. Preloaded content are expected to be used soon. For example, chrome will warn if the preloaded content is not used within 3 or 5 seconds. While project here will not be runned until the user clicks some "run" button.
  // * `preload` results are not shared across different documents, while the iframe content is a different document. The "preloading" is meaningful only when the HTTP cache is shared, which is more like the case of `prefetch`.
  addPrefetchLink(wasmExecUrl)
  addPrefetchLink(ispxWasmUrl)
}
</script>

<script setup lang="ts">
const emit = defineEmits<{
  console: [type: 'log' | 'warn', args: unknown[]]
  loaded: []
  progress: [Progress]
}>()

interface IframeWindow extends Window {
  setAIInteractionAPIEndpoint: (endpoint: string) => void
  setAIInteractionAPITokenProvider: (provider: () => Promise<string>) => void
  startWithZipBuffer: (buf: ArrayBuffer | Uint8Array) => void
  pauseGame(): Promise<void>
  resumeGame(): Promise<void>
  debugGameMethods(): void
  console: typeof console
}

const props = defineProps<{ zipData: ArrayBuffer | Uint8Array }>()

const iframe = ref<HTMLIFrameElement>()

const collector = new ProgressCollector()
const iframeLoadReporter = collector.getSubReporter({ en: 'Preparing environment...', zh: '准备环境中...' }, 1)
const wasmReadyReporter = collector.getSubReporter({ en: 'Loading game engine...', zh: '加载游戏引擎中...' }, 5)
const startWithZipBufferReporter = collector.getSubReporter({ en: 'Starting project...', zh: '开始运行项目...' }, 0.01)

collector.onProgress((progress) => emit('progress', progress))

watch(iframe, () => {
  if (!iframe.value) return
  iframeLoadReporter.report(1)
  const iframeWindow = iframe.value.contentWindow as IframeWindow | null
  if (!iframeWindow) {
    return
  }
  const runnerHtml = ispxRunnerHtml.replace('/wasm_exec.js', wasmExecUrl).replace('ispx.wasm', ispxWasmUrl)

  iframeWindow.document.write(runnerHtml) // This resets the iframe's content, including its window object

  wasmReadyReporter.startAutoReport(10 * 1000)
  iframeWindow.addEventListener('wasmReady', async () => {
    wasmReadyReporter.report(1)

    // Ensure the latest progress update to be rendered to UI
    // This is necessary because now spx runs in the same thread as the main thread of editor.
    // After spx moved to standalone thread (see details in https://github.com/goplus/builder/issues/1496), timeout here can be removed.
    // P.S. It makes more sense to use `nextTick` (from vue) instead, while that does not work as expected.
    await timeout(50)

    iframeWindow.setAIInteractionAPIEndpoint(apiBaseUrl + '/ai/interaction')

    await ensureAccessToken()
    iframeWindow.setAIInteractionAPITokenProvider(async () => (await ensureAccessToken()) ?? '')
    iframeWindow.startWithZipBuffer(props.zipData)
    startWithZipBufferReporter.report(1)
    const canvas = iframeWindow.document.querySelector('canvas')
    if (canvas == null) throw new Error('canvas expected in iframe')
    canvas.focus() // focus to canvas by default, so the user can interact with the game immediately
    
    // 添加录屏边框管理
    setupRecordingBorder(iframeWindow)
    
    emit('loaded')
  })
  iframeWindow.console.log = function (...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.log(...args)
    emit('console', 'log', args)
  }
  iframeWindow.console.warn = function (...args: unknown[]) {
    console.warn(...args)
    emit('console', 'warn', args)
  }
})

// 添加截图方法
const takeScreenshot = async () => {
  const iframeWindow = iframe.value?.contentWindow as IframeWindow | null
  if (!iframeWindow) {
    throw new Error('iframe未准备好')
  }

  // 获取iframe内的game-canvas元素
  const gameCanvas = iframeWindow.document.querySelector('#game-canvas') as HTMLCanvasElement
  if (!gameCanvas) {
    throw new Error('未找到game-canvas元素')
  }

  // 直接从canvas获取图像数据
  const dataURL = gameCanvas.toDataURL('image/png')
  
  return {
    dataURL,
    width: gameCanvas.width,
    height: gameCanvas.height
  }
}

// 暴露截图和游戏控制方法
defineExpose({
  takeScreenshot,
  pauseGame: async () => {
    const iframeWindow = iframe.value?.contentWindow as IframeWindow | null
    if (!iframeWindow) {
      throw new Error('iframe未准备好')
    }
    await iframeWindow.pauseGame()
  },
  resumeGame: async () => {
    const iframeWindow = iframe.value?.contentWindow as IframeWindow | null
    if (!iframeWindow) {
      throw new Error('iframe未准备好')
    }
    await iframeWindow.resumeGame()
  },
  debugGameMethods: () => {
    const iframeWindow = iframe.value?.contentWindow as IframeWindow | null
    if (!iframeWindow) {
      throw new Error('iframe未准备好')
    }
    iframeWindow.debugGameMethods()
  }
})

// 录屏边框管理函数
function setupRecordingBorder(iframeWindow: IframeWindow) {
  let recordingBorder: HTMLElement | null = null
  
  // 监听录屏状态变化
  const unwatch = watch(recordingStore.isRecording, (isRecording: boolean) => {
    if (isRecording) {
      addRecordingBorder(iframeWindow)
    } else {
      removeRecordingBorder(iframeWindow)
    }
  })
  
  // 在组件卸载时清理
  onUnmounted(() => {
    unwatch()
    if (recordingBorder) {
      recordingBorder.remove()
    }
  })
}

// 添加录屏边框
function addRecordingBorder(iframeWindow: IframeWindow) {
  try {
    const canvas = iframeWindow.document.querySelector('canvas') as HTMLCanvasElement
    if (!canvas) {
      console.warn('未找到canvas元素，无法添加录屏边框')
      return
    }
    
    // 检查是否已经有边框
    if (iframeWindow.document.querySelector('.recording-border')) {
      return
    }
    
    // 创建边框元素
    const border = iframeWindow.document.createElement('div')
    border.className = 'recording-border'
    border.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 4px solid #00ff00;
      border-radius: 8px;
      pointer-events: none;
      z-index: 1000;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
      animation: recording-pulse 2s ease-in-out infinite;
    `
    
    // 添加脉冲动画样式
    if (!iframeWindow.document.querySelector('#recording-styles')) {
      const style = iframeWindow.document.createElement('style')
      style.id = 'recording-styles'
      style.textContent = `
        @keyframes recording-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
            border-color: #00ff00;
          }
          50% { 
            box-shadow: 0 0 30px rgba(0, 255, 0, 0.8);
            border-color: #00cc00;
          }
        }
      `
      iframeWindow.document.head.appendChild(style)
    }
    
    // 将边框添加到canvas容器
    const canvasContainer = canvas.parentElement
    if (canvasContainer) {
      canvasContainer.style.position = 'relative'
      canvasContainer.appendChild(border)
      console.log('录屏边框已添加')
    }
  } catch (error) {
    console.error('添加录屏边框失败:', error)
  }
}

// 移除录屏边框
function removeRecordingBorder(iframeWindow: IframeWindow) {
  try {
    const border = iframeWindow.document.querySelector('.recording-border')
    if (border) {
      border.remove()
      console.log('录屏边框已移除')
    }
  } catch (error) {
    console.error('移除录屏边框失败:', error)
  }
}
</script>

<style scoped lang="scss">
.iframe {
  width: 100%;
  height: 100%;
}
</style>
