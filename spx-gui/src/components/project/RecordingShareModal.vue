<template>
  <UIFormModal :title="modalTitle" :visible="props.visible" :auto-focus="false" style="width: 500px"
    @update:visible="handleModalClose">
    <!-- 调试信息 - 临时添加
    <div style="background: red; color: white; padding: 10px; margin: 10px">
      DEBUG: currentState = {{ currentState }}
    </div> -->
    <!-- 录屏界面 (initial/recording状态) -->
    <div v-if="currentState === 'initial' || currentState === 'recording'" class="recording-page">
      <!-- 项目预览区域 -->
      <div class="preview-section">
        <div class="project-preview">
          <!-- 现有的预览内容保持不变 -->
          <img v-if="projectThumbnail" :src="projectThumbnail" alt="Project thumbnail" />

          <div v-else class="placeholder">
            <div class="game-icon">🎮</div>
            <div class="project-name">{{ projectName }}</div>
          </div>

          <!-- 录屏控制按钮 -->
          <div class="record-overlay">
            <UIButton v-if="!isRecording" type="primary" size="large" :loading="isStarting"
              @click="handleStartRecording.fn">
              <template #icon>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <!-- 圆形背景 -->
                  <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.2" />
                  <!-- 播放三角形 -->
                  <polygon points="7,5 15,10 7,15" fill="currentColor" />
                </svg>
              </template>
              {{ $t({ en: 'Record', zh: '录屏' }) }}
            </UIButton>

            <UIButton v-else type="secondary" size="large" :loading="isStopping" @click="handleStopRecording.fn">
              <template #icon>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <!-- 圆形背景 -->
                  <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.2" />
                  <!-- 左竖条 -->
                  <rect x="6.5" y="5" width="2.5" height="10" fill="currentColor" />
                  <!-- 右竖条 -->
                  <rect x="11" y="5" width="2.5" height="10" fill="currentColor" />
                </svg>
              </template>
              {{ $t({ en: 'Stop Recording', zh: '停止录屏' }) }}
            </UIButton>
          </div>
        </div>

        <!-- 录屏状态显示 -->
        <div v-if="isRecording" class="recording-status">
          <div class="recording-indicator">
            <div class="red-dot"></div>
            {{ $t({ en: 'Recording...', zh: '录制中...' }) }}
          </div>
          <div class="recording-time">{{ formatTime(recordingTime) }}</div>
        </div>
      </div>
      <!-- 分享平台区域 - 录屏时显示但禁用 -->
      <div class="share-section">
        <h4>{{ $t({ en: 'Share to Platform', zh: '分享到平台' }) }}</h4>
        <div class="platforms">
          <div v-for="platform in platforms" :key="platform.id"
            :class="['platform-item', { disabled: isRecording || !hasRecording }]"
            @click="isRecording ? null : handlePlatformShare(platform)">
            <div class="platform-icon">
              <component :is="platform.icon" />
            </div>
            <span class="platform-name">{{ platform.name }}</span>
          </div>
        </div>

        <!-- 提示文字 -->
        <div v-if="isRecording" class="tip">
          {{
            $t({
              en: 'Recording in progress, platforms will be available after completion',
              zh: '录制中，完成录制后即可分享到各平台'
            })
          }}
        </div>
        <div v-else-if="!hasRecording" class="tip">
          {{ $t({ en: 'Complete recording to share', zh: '完成录屏后即可分享到各平台' }) }}
        </div>
      </div>
    </div>

    <!-- 平台选择界面 (completed状态) -->
    <div v-else-if="currentState === 'completed'" class="platform-selection-page">
      <!-- 显示录制完成的视频 -->
      <div class="preview-section">
        <div class="project-preview">
          <video v-if="recordedVideoUrl" :src="recordedVideoUrl" controls :poster="projectThumbnail"
            class="recorded-video">
            您的浏览器不支持视频播放
          </video>
        </div>
      </div>
      <div class="auto-save-tip">
        <div class="tip-left">
          <div class="tip-text">
            {{
              $t({
                en: 'Recording saved to your Records. Not satisfied 👉',
                zh: '录屏已保存到您的Records，不满意 👉'
              })
            }}
          </div>
        </div>
        <div class="tip-right">
          <UIButton type="secondary" size="small" @click="handleReRecord">
            {{ $t({ en: 'Re-record', zh: '重新录制' }) }}
          </UIButton>
        </div>
      </div>

      <!-- 分享平台区域 -->
      <div class="share-section">
        <h4>{{ $t({ en: 'Share to Platform', zh: '分享到平台' }) }}</h4>
        <div class="platforms">
          <div v-for="platform in platforms" :key="platform.id" class="platform-item"
            @click="handlePlatformShare(platform)">
            <div class="platform-icon">
              <component :is="platform.icon" />
            </div>
            <span class="platform-name">{{ platform.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 二维码界面 (qrcode状态) -->
    <div v-else-if="currentState === 'qrcode'" class="qrcode-page">
      <div class="qr-header">
        <button class="back-btn" @click="handleBackToPlatforms">← {{ $t({ en: 'Back', zh: '返回' }) }}</button>
        <h3>
          {{
            selectedPlatform === 'qq'
              ? $t({ en: 'Share to QQ', zh: 'QQ分享' })
              : $t({ en: 'Share to WeChat', zh: '微信分享' })
          }}
        </h3>
      </div>

      <div class="qr-content">
        <div class="qr-code-container">
          <img :src="qrCodeData" :alt="$t({ en: 'Share QR Code', zh: '分享二维码' })" class="qr-image" />
        </div>

        <div class="qr-instructions">
          <p v-if="selectedPlatform === 'qq'">
            {{
              $t({
                en: 'Scan the QR code above with QQ to share your game.',
                zh: '使用QQ扫描上方二维码，分享你的游戏作品。'
              })
            }}<br />
          </p>
          <p v-else-if="selectedPlatform === 'wechat'">
            {{
              $t({
                en: 'Scan the QR code above with WeChat to share your game.',
                zh: '使用微信扫描上方二维码，分享你的游戏作品。'
              })
            }}
          </p>
        </div>

        <div class="qr-actions">
          <button class="manual-download-btn" @click="handleManualDownload">
            {{ $t({ en: 'Download Video', zh: '手动下载视频' }) }}
          </button>
          <button class="copy-url-btn" @click="copyShareUrl">{{ $t({ en: 'Copy Link', zh: '复制链接' }) }}</button>
        </div>
      </div>
    </div>
    <!-- 区域选择器 -->
    <AreaSelector v-if="showAreaSelector && screenshotData" :screenshot-data-url="screenshotData.dataUrl"
      :screenshot-width="screenshotData.width" :screenshot-height="screenshotData.height"
      @area-selected="handleAreaSelected" @cancelled="handleAreaSelectionCancelled" />
  </UIFormModal>
</template>

<script setup lang="ts">
import { UIButton, UIFormModal } from '@/components/ui'
import { useMessageHandle } from '@/utils/exception'
import { generateShareQRCode, type ProjectShareInfo } from '@/utils/qrcode'
import { useI18n } from '@/utils/i18n' // 如果还没有导入的话
import QQIconSvg from '@/assets/images/qq.svg?raw'
import WeChatIconSvg from '@/assets/images/微信.svg?raw'
import DouyinIconSvg from '@/assets/images/抖音.svg?raw'
import XiaohongshuIconSvg from '@/assets/images/小红书.svg?raw'
import BilibiliIconSvg from '@/assets/images/bilibili.svg?raw'
import { ref, computed, onUnmounted, h } from 'vue'
import AreaSelector from './AreaSelector.vue'
// import { uploadFile } from '@/apis/usercontent'
import { createRecord } from '@/apis/record'
import { saveFile } from '@/models/common/cloud'
import { File } from '@/models/common/file'

const { t } = useI18n()
// 新增：创建SVG图标组件
const QQIcon = () =>
  h('div', {
    class: 'svg-icon',
    innerHTML: QQIconSvg
  })

const WeChatIcon = () =>
  h('div', {
    class: 'svg-icon',
    innerHTML: WeChatIconSvg
  })

const DouyinIcon = () =>
  h('div', {
    class: 'svg-icon',
    innerHTML: DouyinIconSvg
  })

const XiaohongshuIcon = () =>
  h('div', {
    class: 'svg-icon',
    innerHTML: XiaohongshuIconSvg
  })

const BilibiliIcon = () =>
  h('div', {
    class: 'svg-icon',
    innerHTML: BilibiliIconSvg
  })

const handleModalClose = (visible: boolean, reason?: string | Event) => {
  if (!visible) {
    // 检查关闭原因，如果是点击遮罩则阻止关闭
    if (reason === 'mask' || (reason as any)?.type === 'click') {
      // 阻止因点击遮罩而关闭
      return
    }

    // 如果是录屏完成状态被关闭，重置状态
    if (hasRecording.value) {
      resetRecordingState()
    }

    // 只有明确的关闭动作（如点击X）才触发关闭
    emit('cancelled')
  }
}

// 新增：重新录制处理函数
const handleReRecord = () => {
  // 重置录屏状态
  resetRecordingState()

  // 切换到初始状态
  currentState.value = 'initial'

  console.log('用户选择重新录制，状态已重置')
}

// 区域选择相关状态
const showAreaSelector = ref(false)
const screenshotData = ref<{
  canvas: HTMLCanvasElement
  dataUrl: string
  width: number
  height: number
  screenStream?: MediaStream // 保存屏幕流
} | null>(null)
const selectedRecordingArea = ref<{
  x: number
  y: number
  width: number
  height: number
} | null>(null)

// 重置录屏状态的函数
const resetRecordingState = () => {
  // 重置录屏相关状态
  hasRecording.value = false
  recordedVideoUrl.value = null
  recordingTime.value = 0
  isRecording.value = false
  isStarting.value = false
  isStopping.value = false

  // 重置分享相关状态
  selectedPlatform.value = null
  qrCodeUrl.value = ''
  qrCodeData.value = ''

  // 重置区域选择相关状态
  showAreaSelector.value = false
  screenshotData.value = null
  selectedRecordingArea.value = null

  // 重置页面状态到初始状态
  currentState.value = 'initial'

  // 清理计时器
  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }

  // 清理媒体流
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach((track) => {
      track.stop()
    })
    mediaStream.value = null
  }

  // 清理视频URL
  if (recordedVideoUrl.value) {
    URL.revokeObjectURL(recordedVideoUrl.value)
  }

  // 清理MediaRecorder
  if (mediaRecorder.value) {
    mediaRecorder.value = null
  }

  // 重置区域选择相关状态
  showAreaSelector.value = false
  screenshotData.value = null
  selectedRecordingArea.value = null

  console.log('录屏状态已重置到初始状态')
}

const props = defineProps<{
  visible: boolean
  projectName: string
  projectThumbnail?: string
  owner?: string
  projectId: string
}>()

// 复制分享链接
const copyShareUrl = async () => {
  try {
    await navigator.clipboard.writeText(qrCodeUrl.value)
    console.log('分享链接已复制到剪贴板')
    // 这里可以添加一个提示消息
  } catch (error) {
    console.error('复制链接失败:', error)
  }
}

const emit = defineEmits<{
  cancelled: []
  resolved: []
  recordingStarted: [] // 录屏开始时触发
  recordingStopped: [] // 录屏停止时触发
}>()

// 状态管理
const isRecording = ref(false)
const isStarting = ref(false)
const isStopping = ref(false)
const hasRecording = ref(false)
const recordingTime = ref(0)
const mediaRecorder = ref<MediaRecorder | null>(null)
const recordedVideoUrl = ref<string | null>(null)
// let recordingTimer: number | null = null
let recordingTimer: ReturnType<typeof setInterval> | null = null // 修改这里

// 在现有状态后添加
const selectedPlatform = ref<string | null>(null) // 当前选中的平台
// const showQRCode = ref(false) // 是否显示二维码
const qrCodeUrl = ref<string>('') // 二维码对应的URL
const qrCodeData = ref<string>('') // 二维码数据
const mediaStream = ref<MediaStream | null>(null) // 保存媒体流引用
// 新增：页面状态管理
type PageState = 'initial' | 'recording' | 'completed' | 'qrcode'
const currentState = ref<PageState>('initial')

// 动态标题
const modalTitle = computed(() => {
  switch (currentState.value) {
    case 'initial':
      return t({ en: 'Recording & Share', zh: '录屏分享' })
    case 'recording':
      return t({ en: 'Recording...', zh: '录制中...' })
    case 'completed':
      return t({ en: 'Choose Platform', zh: '选择平台' })
    case 'qrcode':
      return selectedPlatform.value === 'qq' ? 'QQ分享' : '微信分享'
    default:
      return t({ en: 'Recording & Share', zh: '录屏分享' })
  }
})

// 平台配置 - 使用SVG图标，支持双语
const platforms = computed(() => [
  {
    id: 'qq',
    name: t({ en: 'QQ', zh: 'QQ' }),
    icon: QQIcon
  },
  {
    id: 'wechat',
    name: t({ en: 'WeChat', zh: '微信' }),
    icon: WeChatIcon
  },
  {
    id: 'douyin',
    name: t({ en: 'TikTok', zh: '抖音' }),
    icon: DouyinIcon
  },
  {
    id: 'xiaohongshu',
    name: t({ en: 'RedBook', zh: '小红书' }),
    icon: XiaohongshuIcon
  },
  {
    id: 'bilibili',
    name: t({ en: 'Bilibili', zh: 'B站' }),
    icon: BilibiliIcon
  }
])

// 获取屏幕截图的函数

const captureScreenshot = async () => {
  try {
    console.log('开始获取屏幕截图...')

    // 获取屏幕流（不要停止它）
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true // 保持音频，因为后续录制需要
    })

    // 创建video元素来显示流
    const video = document.createElement('video')
    video.srcObject = screenStream
    video.play()

    // 等待视频准备就绪
    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => resolve()
    })

    // 等待一帧确保视频已渲染
    await new Promise((resolve) => setTimeout(resolve, 100))

    // 创建canvas并绘制当前帧
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    const dataUrl = canvas.toDataURL('image/png')
    console.log('屏幕截图获取成功', canvas.width, 'x', canvas.height)

    // 返回截图信息和活跃的流
    return {
      canvas,
      dataUrl,
      width: canvas.width,
      height: canvas.height,
      screenStream // 新增：返回活跃的流
    }
  } catch (error) {
    console.error('获取屏幕截图失败:', error)
    throw error
  }
}

// 开始录屏 - 修改为使用区域选择
const handleStartRecording = useMessageHandle(
  async () => {
    isStarting.value = true
    try {
      console.log('开始录屏流程...')

      // 第一步：获取屏幕截图
      const screenshot = await captureScreenshot()
      screenshotData.value = screenshot

      // 第二步：显示区域选择界面
      showAreaSelector.value = true
    } catch (error) {
      console.error('录制启动失败:', error)
      // 用户可能取消了屏幕分享选择
      if (error instanceof Error && error.name === 'NotAllowedError') {
        console.log('用户取消了屏幕分享')
      }
      throw error
    } finally {
      isStarting.value = false
    }
  },
  { en: 'Failed to start recording', zh: '开始录屏失败' }
)

// 处理区域选择完成
const handleAreaSelected = async (selectedArea: { x: number; y: number; width: number; height: number }) => {
  try {
    console.log('用户选择了录制区域:', selectedArea)

    // 保存选择的区域
    selectedRecordingArea.value = selectedArea

    // 隐藏区域选择器
    showAreaSelector.value = false

    // 更新状态
    isRecording.value = true
    currentState.value = 'recording'

    // 开始区域录制
    const recorder = await startAreaRecording(selectedArea)
    mediaRecorder.value = recorder

    // 通知父组件录屏已开始，隐藏弹窗
    emit('recordingStarted')

    console.log('区域录制已开始')
  } catch (error) {
    console.error('开始区域录制失败:', error)
    // 重置状态
    showAreaSelector.value = false
    selectedRecordingArea.value = null
    throw error
  }
}

// 处理区域选择取消 - 修改版
const handleAreaSelectionCancelled = () => {
  console.log('用户取消了区域选择')

  // 清理屏幕流
  if (screenshotData.value?.screenStream) {
    screenshotData.value.screenStream.getTracks().forEach((track) => {
      track.stop()
    })
  }

  showAreaSelector.value = false
  screenshotData.value = null
  selectedRecordingArea.value = null

  // 重置状态到初始状态
  currentState.value = 'initial'
}

// 区域录制核心函数 - 修改版（复用屏幕流，避免重复权限请求）
const startAreaRecording = async (selectedArea: { x: number; y: number; width: number; height: number }) => {
  try {
    console.log('开始区域录制:', selectedArea)

    // 使用已有的屏幕流，而不是重新获取
    const fullScreenStream = screenshotData.value?.screenStream

    if (!fullScreenStream) {
      throw new Error('屏幕流不可用，需要重新获取权限')
    }

    console.log('复用现有屏幕流，无需重新请求权限')

    // 检查流是否仍然活跃
    const videoTracks = fullScreenStream.getVideoTracks()
    if (videoTracks.length === 0 || videoTracks[0].readyState === 'ended') {
      throw new Error('屏幕流已结束，需要重新获取权限')
    }

    // 创建canvas用于裁剪指定区域
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    // 设置canvas尺寸为选中区域大小
    canvas.width = selectedArea.width
    canvas.height = selectedArea.height

    // 创建video元素来显示完整屏幕流
    const video = document.createElement('video')
    video.srcObject = fullScreenStream
    video.play()

    // 等待视频准备就绪
    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => {
        console.log('视频流准备就绪，尺寸:', video.videoWidth, 'x', video.videoHeight)
        resolve()
      }
    })

    // 保存原始流引用
    mediaStream.value = fullScreenStream

    // 开始绘制循环
    let animationId: number
    const drawFrame = () => {
      if (!isRecording.value) {
        console.log('录制已停止，停止绘制循环')
        return
      }

      try {
        // 将指定区域绘制到canvas
        ctx.drawImage(
          video,
          selectedArea.x,
          selectedArea.y,
          selectedArea.width,
          selectedArea.height, // 源区域
          0,
          0,
          canvas.width,
          canvas.height // 目标区域
        )
        animationId = requestAnimationFrame(drawFrame)
      } catch (error) {
        console.error('绘制帧时出错:', error)
        // 如果绘制出错，停止录制
        if (isRecording.value) {
          handleStopRecording.fn()
        }
      }
    }

    // 开始绘制循环
    drawFrame()

    // 从canvas获取录制流
    const recordingStream = canvas.captureStream(30) // 30fps
    console.log('Canvas录制流已创建，帧率: 30fps')

    // 如果需要音频，从原始流中添加音频轨道
    const audioTracks = fullScreenStream.getAudioTracks()
    if (audioTracks.length > 0) {
      recordingStream.addTrack(audioTracks[0])
      console.log('已添加音频轨道到录制流')
    } else {
      console.log('原始流中没有音频轨道')
    }

    // 检查MediaRecorder支持的格式
    let mimeType = 'video/webm'
    if (!MediaRecorder.isTypeSupported('video/webm')) {
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4'
      } else {
        console.warn('浏览器不支持常见的视频格式，使用默认格式')
        mimeType = ''
      }
    }
    console.log('使用录制格式:', mimeType)

    // 创建MediaRecorder录制处理后的流
    const recorder = new MediaRecorder(recordingStream, {
      mimeType: mimeType || undefined
    })

    const chunks: Blob[] = []

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
        console.log('录制数据块大小:', event.data.size, 'bytes')
      }
    }

    recorder.onstop = () => {
      console.log('区域录制停止，开始生成视频文件')

      // 停止绘制循环
      if (animationId) {
        cancelAnimationFrame(animationId)
        console.log('绘制循环已停止')
      }

      // 检查是否有录制数据
      if (chunks.length === 0) {
        console.error('没有录制到任何数据')
        return
      }

      // 生成录制文件
      const totalSize = chunks.reduce((total, chunk) => total + chunk.size, 0)
      console.log('总录制数据大小:', totalSize, 'bytes')

      const blob = new Blob(chunks, {
        type: recorder.mimeType || 'video/webm'
      })
      console.log('生成的Blob大小:', blob.size, 'bytes, 类型:', blob.type)

      const url = URL.createObjectURL(blob)
      recordedVideoUrl.value = url
      hasRecording.value = true
      currentState.value = 'completed'

      console.log('视频文件已生成，URL:', url)

      // 自动创建Record记录
      createRecordFromRecording().catch((error) => {
        console.error('创建Record记录失败:', error)
      })

      emit('recordingStopped')
    }

    recorder.onerror = (event) => {
      console.error('MediaRecorder录制出错:', event)
    }

    recorder.onstart = () => {
      console.log('MediaRecorder已开始录制')
    }

    // 开始录制
    recorder.start(1000) // 每秒生成一个数据块
    console.log('区域录制已开始，MediaRecorder状态:', recorder.state)

    // 开始计时
    recordingTime.value = 0
    recordingTimer = setInterval(() => {
      recordingTime.value++
    }, 1000)

    // 监听流结束事件（用户停止分享屏幕）
    fullScreenStream.getVideoTracks()[0].addEventListener('ended', () => {
      console.log('屏幕分享流已结束')
      if (isRecording.value) {
        console.log('自动停止录制')
        handleStopRecording.fn()
      }
    })

    return recorder
  } catch (error) {
    console.error('区域录制失败:', error)

    // 清理资源
    if (screenshotData.value?.screenStream) {
      screenshotData.value.screenStream.getTracks().forEach((track) => {
        track.stop()
      })
    }

    throw error
  }
}

// 停止录屏
const handleStopRecording = useMessageHandle(
  async () => {
    isStopping.value = true
    try {
      console.log('开始停止录制...')

      // 1. 停止MediaRecorder
      if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
        mediaRecorder.value.stop()
        console.log('MediaRecorder已停止')
      }

      // ========== 新增：完全停止屏幕分享流 ========
      if (mediaStream.value) {
        // 停止所有轨道（视频和音频）
        mediaStream.value.getTracks().forEach((track) => {
          track.stop()
          console.log(`已停止${track.kind}轨道`)
        })
        mediaStream.value = null
        console.log('屏幕分享流已完全停止')
      }
      // =============================================

      // 2. 重置状态
      isRecording.value = false

      // 3. 停止计时器
      if (recordingTimer) {
        clearInterval(recordingTimer)
        recordingTimer = null
      }

      emit('recordingStopped')
      console.log('录制完全停止，状态已重置')
    } finally {
      isStopping.value = false
    }
  },
  { en: 'Failed to stop recording', zh: '停止录屏失败' }
)

// 图片处理函数 - 添加到 <script setup> 部分
const processImageForBilibili = async (imageBlob: Blob, projectName: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    img.onload = () => {
      try {
        const originalWidth = img.width
        const originalHeight = img.height

        console.log(`原始图片尺寸: ${originalWidth}x${originalHeight}`)

        // B站要求最小尺寸：960x600
        const minWidth = 960
        const minHeight = 600

        // 计算缩放比例，确保两个维度都满足最小要求
        const scaleX = minWidth / originalWidth
        const scaleY = minHeight / originalHeight
        const scale = Math.max(scaleX, scaleY) // 取较大的缩放比例，确保都满足最小尺寸

        // 计算新尺寸
        let newWidth = Math.ceil(originalWidth * scale)
        let newHeight = Math.ceil(originalHeight * scale)

        // 确保尺寸不小于要求
        newWidth = Math.max(newWidth, minWidth)
        newHeight = Math.max(newHeight, minHeight)

        console.log(`处理后尺寸: ${newWidth}x${newHeight} (缩放比例: ${scale.toFixed(2)})`)

        // 设置canvas尺寸
        canvas.width = newWidth
        canvas.height = newHeight

        // 绘制背景（防止透明图片问题）
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, newWidth, newHeight)

        // 计算图片在canvas中的位置（居中）
        const drawWidth = originalWidth * scale
        const drawHeight = originalHeight * scale
        const x = (newWidth - drawWidth) / 2
        const y = (newHeight - drawHeight) / 2

        // 使用高质量缩放
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // 绘制图片
        ctx.drawImage(img, x, y, drawWidth, drawHeight)

        // 添加XBuilder标识（可选）
        ctx.fillStyle = 'rgba(0, 161, 214, 0.8)'
        ctx.font = '24px Arial, sans-serif'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'bottom'
        ctx.fillText('XBuilder', newWidth - 20, newHeight - 20)

        // 转换为Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`封面处理完成，文件大小: ${(blob.size / 1024).toFixed(2)} KB`)
              resolve(blob)
            } else {
              reject(new Error('Canvas转换Blob失败'))
            }
          },
          'image/jpeg',
          0.9 // 质量设置为90%
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }

    // 加载图片
    img.src = URL.createObjectURL(imageBlob)
  })
}

const createRecordFromRecording = async () => {
  if (!recordedVideoUrl.value) {
    console.warn('没有录制的视频，跳过创建Record')
    return
  }

  try {
    console.log('开始创建Record记录...')

    // 1. 获取视频Blob并上传到七牛云（使用正确的saveFile函数）
    const response = await fetch(recordedVideoUrl.value)
    const videoBlob = await response.blob()

    // 创建File对象（项目系统的File，不是浏览器原生File）
    const videoFile = new File(`record-${props.projectName}-${Date.now()}.webm`, async () => {
      return videoBlob.arrayBuffer()
    }, { type: 'video/webm' })

    // 使用项目系统的saveFile函数上传，获得kodo://格式的Universal URL
    const videoUniversalUrl = await saveFile(videoFile)
    console.log('视频上传成功，Universal URL:', videoUniversalUrl)

    // 2. 处理并上传缩略图（同样使用正确的saveFile函数）
    let thumbnailUniversalUrl = ''

    if (props.projectThumbnail) {
      try {
        console.log('开始处理并上传缩略图...')

        // 获取缩略图数据
        let thumbnailBlob: Blob
        if (props.projectThumbnail.startsWith('blob:')) {
          // 如果是blob URL，直接fetch获取
          const thumbnailResponse = await fetch(props.projectThumbnail)
          thumbnailBlob = await thumbnailResponse.blob()
        } else {
          // 如果是普通URL，也尝试fetch获取
          const thumbnailResponse = await fetch(props.projectThumbnail)
          thumbnailBlob = await thumbnailResponse.blob()
        }

        // 创建缩略图File对象（项目系统的File）
        const thumbnailFile = new File(`thumbnail-${props.projectName}-${Date.now()}.jpg`, async () => {
          return thumbnailBlob.arrayBuffer()
        }, { type: 'image/jpeg' })

        // 使用项目系统的saveFile函数上传，获得kodo://格式的Universal URL
        thumbnailUniversalUrl = await saveFile(thumbnailFile)
        console.log('缩略图上传成功，Universal URL:', thumbnailUniversalUrl)
      } catch (thumbnailError) {
        console.warn('缩略图上传失败，将使用空字符串:', thumbnailError)
        thumbnailUniversalUrl = ''
      }
    }

    // 3. 准备Record数据（使用Universal URL而不是Web URL）
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const recordData = {
      projectId: parseInt(props.projectId),
      name: `record-${timestamp.slice(0, 19)}`,
      title: `${props.projectName} 录屏 - ${new Date().toLocaleString('zh-CN')}`,
      description: `这是项目 ${props.projectName} 的录屏记录`,
      videoUrl: videoUniversalUrl, // ✅ 使用kodo://格式的Universal URL
      thumbnailUrl: thumbnailUniversalUrl, // ✅ 使用kodo://格式的Universal URL
      duration: Math.floor(recordingTime.value),
      fileSize: videoBlob.size
    }

    // 4. 创建Record记录
    const record = await createRecord(recordData)
    console.log('Record创建成功:', record)
  } catch (error) {
    console.error('创建Record记录失败:', error)
  }
}

// B站分享处理
const handleBilibiliShare = useMessageHandle(
  async () => {
    if (!recordedVideoUrl.value) {
      throw new Error('录屏视频不存在')
    }

    console.log('开始B站投稿流程...')

    // 检查登录状态代码...
    const loginCheckResponse = await fetch('http://localhost:3000/check-login')
    const loginStatus = await loginCheckResponse.json()

    if (!loginStatus.browserReady) {
      const loginResponse = await fetch('http://localhost:3000/login')
      const loginResult = await loginResponse.json()

      if (!loginResult.success) {
        throw new Error(`登录失败：${loginResult.message}`)
      }
    }

    // 1. 获取视频Blob
    const response = await fetch(recordedVideoUrl.value)
    const videoBlob = await response.blob()

    // 2. 投稿信息
    const title = `【XBuilder作品】${props.projectName}`
    const description = `这是我在XBuilder上创作的游戏作品《${props.projectName}》！

🎮 在XBuilder学编程，创造属于你的游戏世界！
📱 快来XBuilder创建你的第一个游戏吧！

#XBuilder #游戏开发 #编程学习 #创意游戏`

    const tags = 'XBuilder,游戏,编程,创作,教育'
    const category = 'game'

    // 3. 准备FormData - 直接使用Blob，避免File构造函数问题
    const formData = new FormData()
    
    // 使用Blob的三参数形式，第三个参数是文件名
    formData.append('video', videoBlob, `${props.projectName}.webm`)
    formData.append('title', title)
    formData.append('description', description)
    formData.append('tags', tags)
    formData.append('category', category)

    // 处理封面图片
    if (props.projectThumbnail) {
      try {
        const thumbnailResponse = await fetch(props.projectThumbnail)
        const thumbnailBlob = await thumbnailResponse.blob()
        const processedCoverBlob = await processImageForBilibili(thumbnailBlob, props.projectName)
        
        // 直接使用Blob，指定文件名
        formData.append('cover', processedCoverBlob, `${props.projectName}-cover.jpg`)
        
        console.log('封面图片已处理并添加到FormData')
      } catch (error) {
        console.warn('封面图片处理失败，将使用默认封面:', error)
      }
    }

    // 4. 调用B站投稿服务
    const response2 = await fetch('http://localhost:3000/auto-upload', {
      method: 'POST',
      body: formData
    })

    const result = await response2.json()

    if (result.success) {
      console.log('B站投稿成功！', result)
    } else {
      throw new Error(result.message || 'B站投稿失败')
    }
  },
  { en: 'Failed to share to Bilibili', zh: 'B站分享失败' },
  { en: 'Successfully shared to Bilibili!', zh: 'B站投稿成功！' }
)

// 处理QQ和微信分享
const handleSocialMediaShare = async (platform: any) => {
  try {
    selectedPlatform.value = platform.id

    // 准备项目分享信息
    const projectInfo: ProjectShareInfo = {
      projectName: props.projectName,
      // projectUrl: `${window.location.origin}/project/${props.owner}/${props.projectName}`, // 根据实际路由调整
      projectUrl: `https://builder.goplus.org/project/${props.owner}/${props.projectName}`,
      description: `这是我在XBuilder上创作的游戏作品《${props.projectName}》！🎮 在XBuilder学编程，创造属于你的游戏世界！`,
      thumbnail: props.projectThumbnail
    }

    // 生成二维码
    console.log(`正在生成${platform.name}分享二维码...`)
    const qrCodeDataUrl = await generateShareQRCode(platform.id, projectInfo, {
      width: 200,
      margin: 3
    })

    qrCodeData.value = qrCodeDataUrl
    // showQRCode.value = true
    qrCodeUrl.value = projectInfo.projectUrl // 暂定为 projectUrl

    console.log(`${platform.name}分享二维码已生成`)
  } catch (error) {
    console.error(`生成${platform.name}分享二维码失败:`, error)
    // 可以显示错误提示给用户
  }
}

// 修改分享到平台的函数
const handlePlatformShare = async (platform: any) => {
  if (!hasRecording.value) {
    console.log('录屏尚未完成，无法分享')
    return
  }

  console.log(`准备分享到${platform.name}`)

  // 特殊处理B站平台
  if (platform.id === 'bilibili') {
    await handleBilibiliShare.fn()
    return
  }

  // 处理QQ和微信平台 - 显示二维码
  if (platform.id === 'qq' || platform.id === 'wechat') {
    selectedPlatform.value = platform.id
    await handleSocialMediaShare(platform)
    currentState.value = 'qrcode'
    return
  }

  // 其他平台保持原有逻辑（直接下载）
  if (recordedVideoUrl.value) {
    const link = document.createElement('a')
    link.download = `${props.projectName}-for-${platform.id}.webm`
    link.href = recordedVideoUrl.value
    link.click()
    console.log(`已为${platform.name}下载视频文件`)
  }
}

// 格式化时间
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 手动下载视频文件
const handleManualDownload = () => {
  if (recordedVideoUrl.value && selectedPlatform.value) {
    const link = document.createElement('a')
    link.download = `${props.projectName}-for-${selectedPlatform.value}.webm`
    link.href = recordedVideoUrl.value
    link.click()
    console.log(`手动下载${selectedPlatform.value}平台视频文件`)
  }
}

// 返回到平台选择页面
const handleBackToPlatforms = () => {
  currentState.value = 'completed'
  selectedPlatform.value = null
  qrCodeUrl.value = ''
  qrCodeData.value = ''
}

// 清理定时器和资源
// 修改 onUnmounted 函数
onUnmounted(() => {
  // 清理计时器
  if (recordingTimer) {
    clearInterval(recordingTimer)
  }

  // 清理视频URL
  if (recordedVideoUrl.value) {
    URL.revokeObjectURL(recordedVideoUrl.value)
  }

  // ========== 新增：清理媒体流 ==========
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach((track) => {
      track.stop()
    })
    mediaStream.value = null
  }
  // ====================================
})
</script>

<style scoped lang="scss">
.preview-section {
  margin-bottom: 20px;
}

.project-preview {
  position: relative;
  width: 100%;
  height: 240px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: 2px solid #e1e5e9;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #64748b;

    .game-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .project-name {
      font-size: 18px;
      font-weight: 600;
      color: #334155;
    }
  }
}

.record-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.recording-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fca5a5;
  border-radius: 8px;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc2626;
  font-weight: 600;
  font-size: 14px;
}

.red-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #dc2626;
  animation: pulse 1s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.recording-time {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 16px;
  color: #dc2626;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
}

.share-section {
  h4 {
    margin: 13px 0px;
    color: #1e293b;
    font-size: 16px;
    font-weight: 600;
  }
}

.platforms {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.platform-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid #e2e8f0;
  background: white;

  &:not(.disabled):hover {
    border-color: #3b82f6;
    background: #f8fafc;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: #f8fafc;

    &:hover {
      transform: none;
      box-shadow: none;
      border-color: #e2e8f0;
    }
  }
}

.platform-icon {
  margin-bottom: 8px;

  :deep(.svg-icon) {
    width: 42px;
    height: 42px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;

    // svg {
    //   width: 28px;
    //   height: 28px;
    //   max-width: 100%;
    //   max-height: 100%;
    // }
  }
}

.platform-name {
  font-size: 12px;
  color: #475569;
  font-weight: 500;
  text-align: center;
}

.tip {
  text-align: center;
  color: #64748b;
  font-size: 13px;
  padding: 12px;
  background: #f1f5f9;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.recorded-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.recording-complete {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%);
  border-radius: 8px;
  border: 1px solid #93c5fd;

  .complete-indicator {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: #059669;

    .green-dot {
      width: 8px;
      height: 8px;
      background-color: #10b981;
      border-radius: 50%;
      margin-right: 8px;
    }
  }

  .video-info {
    color: #0369a1;
    font-size: 14px;
  }
}

// 新增：页面布局样式
.recording-page,
.platform-selection-page,
.qrcode-page {
  min-height: 300px;
}

// 新增：二维码页面样式
.qr-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;

  .back-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    font-size: 14px;
    padding: 8px;
    border-radius: 4px;
    margin-right: 12px;

    &:hover {
      background: #f5f5f5;
      color: #333;
    }
  }

  h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
  }
}

.qr-content {
  text-align: center;

  .qr-code-container {
    padding: 20px;
    background: #f8f9fa;
    border-radius: 12px;
    margin-bottom: 20px;

    .qr-image {
      width: 200px;
      height: 200px;
      border-radius: 8px;
    }
  }
}

.qr-content {
  text-align: center;

  .qr-code-container {
    padding: 20px;
    background: #f8f9fa;
    border-radius: 12px;
    margin-bottom: 20px;

    .qr-image {
      width: 200px;
      height: 200px;
      border-radius: 8px;
    }
  }

  .qr-instructions {
    margin-bottom: 24px;

    p {
      color: #666;
      line-height: 1.6;
      margin: 0;
      font-size: 14px;
    }
  }

  .qr-actions {
    display: flex;
    gap: 12px;
    justify-content: center;

    button {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &.manual-download-btn {
        background: #52c41a;
        color: white;

        &:hover {
          background: #389e0d;
        }
      }

      &.copy-url-btn {
        background: #1890ff;
        color: white;

        &:hover {
          background: #096dd9;
        }
      }
    }
  }
}

.auto-save-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 13px;
  margin-top: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 8px;

  .tip-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0; // 防止文本溢出
  }

  .tip-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .tip-text {
    color: #0369a1;
    font-size: 13px;
    line-height: 1.4;
  }

  .tip-right {
    flex-shrink: 0;
  }
}
</style>