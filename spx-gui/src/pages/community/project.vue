<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useMessageHandle } from '@/utils/exception/index'
import { useQuery } from '@/utils/query'
import { useIsLikingProject, useLikeProject, useUnlikeProject } from '@/stores/liking'
import { humanizeCount, humanizeExactCount, untilNotNull } from '@/utils/utils'
import { useEnsureSignedIn } from '@/utils/user'
import { usePageTitle } from '@/utils/utils'
import { ownerAll, recordProjectView, stringifyProjectFullName, stringifyRemixSource, Visibility } from '@/apis/project'
import { listProject } from '@/apis/project'
import { listReleases } from '@/apis/project-release'
import { Project } from '@/models/project'
import { useUser, isSignedIn, getSignedInUsername } from '@/stores/user'
import { recordingStore } from '@/stores/recording'
import { getOwnProjectEditorRoute, getProjectEditorRoute, getUserPageRoute } from '@/router'
import RecordingShareModal from '@/components/project/RecordingShareModal.vue'
import { useFileUrl } from '@/utils/file'
import {
  UIIcon,
  UILoading,
  UIError,
  UIButton,
  UIDropdown,
  UIMenu,
  UIMenuItem,
  UICollapse,
  UICollapseItem,
  UIDivider,
  useResponsive,
  UITooltip
} from '@/components/ui'
import CenteredWrapper from '@/components/community/CenteredWrapper.vue'
import ProjectsSection from '@/components/community/ProjectsSection.vue'
import ProjectItem from '@/components/project/ProjectItem.vue'
import ProjectRunner from '@/components/project/runner/ProjectRunner.vue'
import FullScreenProjectRunner from '@/components/project/runner/FullScreenProjectRunner.vue'
import RemixedFrom from '@/components/community/project/RemixedFrom.vue'
import OwnerInfo from '@/components/community/project/OwnerInfo.vue'
import { useCreateProject, useRemoveProject, useShareProject, useUnpublishProject } from '@/components/project'
import CommunityCard from '@/components/community/CommunityCard.vue'
import ReleaseHistory from '@/components/community/project/ReleaseHistory.vue'
import TextView from '@/components/community/TextView.vue'
import ScreenshotShareModal from '@/components/project/ScreenshotShareModal.vue'

const props = defineProps<{
  owner: string
  name: string
}>()

const router = useRouter()

const {
  data: project,
  isLoading,
  error,
  refetch: reloadProject
} = useQuery(
  async (ctx) => {
    const p = new Project()
    ;(window as any).project = p // for debug purpose, TODO: remove me
    const loaded = await p.loadFromCloud(props.owner, props.name, true, ctx.signal)
    return loaded
  },
  {
    en: 'Failed to load project',
    zh: '加载项目失败'
  }
)

const { data: ownerInfo } = useUser(() => props.owner)

usePageTitle(() => {
  if (ownerInfo.value == null) return null
  return [
    {
      en: props.name,
      zh: props.name
    },
    {
      en: ownerInfo.value.displayName,
      zh: ownerInfo.value.displayName
    }
  ]
})

watch(
  () => [props.owner, props.name],
  () => isSignedIn() && recordProjectView(props.owner, props.name),
  { immediate: true }
)

const runnerState = ref<'initial' | 'loading' | 'running'>('initial')
watch(
  () => [props.owner, props.name],
  () => {
    runnerState.value = 'initial'
  }
)

// 监听游戏状态变化，重置录屏状态
watch(runnerState, (newState) => {
  if (newState === 'initial') {
    // 游戏停止时，重置所有录屏相关状态
    console.log('游戏状态变为initial，重置录屏状态')
    isRecording.value = false
    isStarting.value = false
    isStopping.value = false
    hasRecording.value = false
    recordingTime.value = 0
    showRecordingModal.value = false
    
    // 清理录屏资源
    if (mediaRecorder.value) {
      // 如果正在录制，先停止
      if (mediaRecorder.value.state === 'recording') {
        try {
          mediaRecorder.value.stop()
        } catch (error) {
          console.warn('停止MediaRecorder时出错:', error)
        }
      }
      mediaRecorder.value = null
    }
    if (recordingTimer) {
      clearInterval(recordingTimer)
      recordingTimer = null
    }
    if (currentAnimationId) {
      cancelAnimationFrame(currentAnimationId)
      currentAnimationId = null
    }
    if (recordedVideoUrl.value) {
      URL.revokeObjectURL(recordedVideoUrl.value)
      recordedVideoUrl.value = null
    }
    
    // 通知录屏状态管理器
    recordingStore.stopRecording()
  }
})

const isOwner = computed(() => props.owner === getSignedInUsername())
const { data: liking } = useIsLikingProject(() => ({ owner: props.owner, name: props.name }))

const projectRunnerRef = ref<InstanceType<typeof ProjectRunner> | null>(null)
const isFullScreenRunning = ref(false)
// 录屏相关状态
const showRecordingModal = ref(false)
const isRecording = ref(false)
const isStarting = ref(false)
const isStopping = ref(false)
const hasRecording = ref(false)
const recordingTime = ref(0)
const mediaRecorder = ref<MediaRecorder | null>(null)
const recordedVideoUrl = ref<string | null>(null)
let recordingTimer: ReturnType<typeof setInterval> | null = null
// 新增：用于管理绘制循环的ID
let currentAnimationId: number | null = null
// 新增：弹窗组件引用
const recordingModalRef = ref<InstanceType<typeof RecordingShareModal> | null>(null)
const isScreenshotModalVisible = ref(false)
const screenshotDataUrl = ref<string | undefined>()
const screenshotWidth = ref<number | undefined>()
const screenshotHeight = ref<number | undefined>()
const [thumbnailUrl] = useFileUrl(() => project.value?.thumbnail)

// 使用类型断言避免全局声明冲突
// Type declaration for QQ mqq API
declare global {
    interface Window {
      mqq: {
        invoke: (module: string, method: string, data: any) => void
      }
    }
  }
// 2. 分享数据
const shareData = {
  title: `${props.owner}/${props.name}`,
  desc: `${project.value?.description}` || '分享来自XBuilder的创意项目',
  share_url: `https://xbuilder-sharing-test.gopluscdn.com/project/${props.owner}/${props.name}`,
  image_url: 'https://i.gtimg.cn/open/app_icon/05/58/35/77/1105583577_100_m.png'
}

// 检查QQ浏览器环境并显示调试信息
function checkQQEnvironment() {
  
  // 尝试调用QQ分享API
  if (window.mqq) {
    try {
      window.mqq.invoke('data', 'setShareInfo', shareData)
      // showDebugMessage('QQ分享设置成功！')
    } catch (error) {
      // showDebugMessage('QQ分享设置失败: ' + (error instanceof Error ? error.message : String(error)))
    }
  } else {
    // showDebugMessage('未检测到QQ浏览器环境')
  }
}

// 页面加载完成后执行检测
onMounted(() => {
  // 页面初始化时重置录屏相关状态，避免直接弹窗
  showRecordingModal.value = false
  hasRecording.value = false
  isRecording.value = false
  // console.log('onMounted 被调用') // 调试日志
  // 延迟执行，确保QQ环境完全加载
  setTimeout(() => {
    // console.log('延迟执行 checkQQEnvironment') // 调试日志
    checkQQEnvironment()
  }, 1000)
})

const likeCount = computed(() => {
  if (project.value == null) return null
  const count = humanizeExactCount(project.value.likeCount)
  return {
    title: {
      en: `Liked by ${count.en} users`,
      zh: `${count.zh} 个用户喜欢`
    },
    text: humanizeCount(project.value.likeCount)
  }
})

const viewCount = computed(() => {
  if (project.value == null) return null
  const count = humanizeCount(project.value.viewCount)
  return {
    title: {
      en: `Viewed ${count.en} times`,
      zh: `被查看 ${count.zh} 次`
    },
    text: count
  }
})

const remixCount = computed(() => {
  if (project.value == null) return null
  const count = humanizeCount(project.value.remixCount)
  return {
    title: {
      en: `Remixed ${count.en} times`,
      zh: `被改编 ${count.zh} 次`
    },
    text: count
  }
})

const ensureSignedIn = useEnsureSignedIn()

const handleRun = useMessageHandle(
  async () => {
    // 开始新游戏时，重置录屏状态
    if (isRecording.value || hasRecording.value) {
      console.log('开始新游戏，重置录屏状态')
      isRecording.value = false
      isStarting.value = false
      isStopping.value = false
      hasRecording.value = false
      recordingTime.value = 0
      showRecordingModal.value = false
      
      // 清理录屏资源
      if (mediaRecorder.value) {
        // 如果正在录制，先停止
        if (mediaRecorder.value.state === 'recording') {
          try {
            mediaRecorder.value.stop()
          } catch (error) {
            console.warn('停止MediaRecorder时出错:', error)
          }
        }
        mediaRecorder.value = null
      }
      if (recordingTimer) {
        clearInterval(recordingTimer)
        recordingTimer = null
      }
      if (currentAnimationId) {
        cancelAnimationFrame(currentAnimationId)
        currentAnimationId = null
      }
      if (recordedVideoUrl.value) {
        URL.revokeObjectURL(recordedVideoUrl.value)
        recordedVideoUrl.value = null
      }
      
      // 通知录屏状态管理器
      recordingStore.stopRecording()
    }
    
    runnerState.value = 'loading'
    await projectRunnerRef.value?.run()
    runnerState.value = 'running'
  },
  { en: 'Failed to run project', zh: '运行项目失败' }
)

const handleStop = useMessageHandle(
  async () => {
    await projectRunnerRef.value?.stop()
    runnerState.value = 'initial'
    
    // 手动停止游戏时，确保录屏状态被重置
    if (isRecording.value || hasRecording.value) {
      console.log('手动停止游戏，重置录屏状态')
      isRecording.value = false
      isStarting.value = false
      isStopping.value = false
      hasRecording.value = false
      recordingTime.value = 0
      showRecordingModal.value = false
      
      // 清理录屏资源
      if (mediaRecorder.value) {
        // 如果正在录制，先停止
        if (mediaRecorder.value.state === 'recording') {
          try {
            mediaRecorder.value.stop()
          } catch (error) {
            console.warn('停止MediaRecorder时出错:', error)
          }
        }
        mediaRecorder.value = null
      }
      if (recordingTimer) {
        clearInterval(recordingTimer)
        recordingTimer = null
      }
      if (currentAnimationId) {
        cancelAnimationFrame(currentAnimationId)
        currentAnimationId = null
      }
      if (recordedVideoUrl.value) {
        URL.revokeObjectURL(recordedVideoUrl.value)
        recordedVideoUrl.value = null
      }
      
      // 通知录屏状态管理器
      recordingStore.stopRecording()
    }
  },
  { en: 'Failed to stop project', zh: '停止项目失败' }
)

const handleRerun = useMessageHandle(async () => projectRunnerRef.value?.rerun(), {
  en: 'Failed to rerun project',
  zh: '重新运行项目失败'
})

const handleEdit = useMessageHandle(
  async () => {
    const projectEditorRoute = getProjectEditorRoute(props.owner, props.name)
    await router.push(projectEditorRoute)
  },
  { en: 'Failed to open editor', zh: '打开编辑器失败' },
  undefined
)

const likeProject = useLikeProject()
const handleLike = useMessageHandle(
  async () => {
    await ensureSignedIn()
    await likeProject(props.owner, props.name)
    await project.value?.loadFromCloud(props.owner, props.name, true) // refresh project info (likeCount)
  },
  { en: 'Failed to like', zh: '标记喜欢失败' },
  undefined
)

const unlikeProject = useUnlikeProject()
const handleUnlike = useMessageHandle(
  async () => {
    await ensureSignedIn()
    await unlikeProject(props.owner, props.name)
    await project.value?.loadFromCloud(props.owner, props.name, true) // refresh project info (likeCount)
  },
  { en: 'Failed to unlike', zh: '取消喜欢失败' },
  undefined
)

const isTogglingLike = computed(() => (liking.value ? handleUnlike.isLoading.value : handleLike.isLoading.value))

function handleToggleLike() {
  return (liking.value ? handleUnlike.fn : handleLike.fn)()
}

const shareProject = useShareProject()

const handleShare = useMessageHandle(async () => {
  // 在移动端显示分享提示蒙版
  if (isMobile.value) {
    showMobileShareHint.value = true
    return
  }
  
  // 桌面端正常显示分享弹窗
  const p = await untilNotNull(project) as Project
  await shareProject(
    props.owner, 
    props.name, 
    thumbnailUrl.value || '',
    props.owner, // 创作者名字
    p.description, // 项目描述
    {
      viewCount: p.viewCount,
      likeCount: p.likeCount,
      remixCount: p.remixCount
    }
  )
}, {
  en: 'Failed to share project',
  zh: '分享项目失败'
})

// 移动端分享提示状态
const showMobileShareHint = ref(false)

// 关闭移动端分享提示
function closeMobileShareHint() {
  showMobileShareHint.value = false
}

const createProject = useCreateProject()

const handleRemix = useMessageHandle(
  async () => {
    await ensureSignedIn()
    const name = await createProject(stringifyRemixSource(props.owner, props.name))
    router.push(getOwnProjectEditorRoute(name))
  },
  { en: 'Failed to remix project', zh: '改编项目失败' },
  undefined
)

const releasesRet = useQuery(
  async () => {
    const { owner, name } = props
    const { data } = await listReleases({
      projectFullName: stringifyProjectFullName(owner, name),
      orderBy: 'createdAt',
      sortOrder: 'desc',
      pageIndex: 1,
      pageSize: 10 // load at most 10 recent releases
    })
    return data
  },
  { en: 'Load release history failed', zh: '加载发布历史失败' }
)

const hasRelease = computed(() => releasesRet.data.value != null && releasesRet.data.value?.length > 0)

const unpublishProject = useUnpublishProject()
const handleUnpublish = useMessageHandle(
  async () => {
    const p = await untilNotNull(project)
    await unpublishProject(p)
    releasesRet.refetch()
  },
  { en: 'Failed to unpublish project', zh: '取消发布项目失败' },
  {
    en: 'Project unpublished',
    zh: '已取消发布'
  }
)
const handleScreenshot = useMessageHandle(
  async () => {
    try {
      // 获取项目运行器引用
      const projectRunner = projectRunnerRef.value
      if (!projectRunner) {
        throw new Error('项目运行器未准备好')
      }

      // 等待项目运行器完全初始化
      let retryCount = 0
      const maxRetries = 50
      while (retryCount < maxRetries) {
        try {
          // 尝试调用pauseGame，如果成功说明已经完全初始化
          await projectRunner.pauseGame()
          // 如果成功，立即恢复游戏
          await projectRunner.resumeGame()
          break
        } catch (error) {
          await new Promise(resolve => setTimeout(resolve, 200))
          retryCount++
        }
      }

      if (retryCount >= maxRetries) {
        throw new Error('项目运行器初始化超时')
      }

      // 暂停游戏
      await projectRunner.pauseGame()
      console.log('游戏已暂停')

      // 使用项目运行器的截图方法
      const screenshot = await projectRunner.takeScreenshot()
      if (!screenshot) {
        throw new Error('截图方法返回空结果')
      }

      // 设置截图数据
      screenshotDataUrl.value = screenshot.dataURL
      screenshotWidth.value = screenshot.width
      screenshotHeight.value = screenshot.height

      console.log('成功从游戏canvas获取截图', screenshot.width, 'x', screenshot.height)
      isScreenshotModalVisible.value = true
    } catch (error) {
      console.error('截图失败:', error)
      // 如果截图失败，也要恢复游戏
      try {
        const projectRunner = projectRunnerRef.value
        if (projectRunner) {
          await projectRunner.resumeGame()
          console.log('游戏已恢复（截图失败后）')
        }
      } catch (resumeError) {
        console.error('恢复游戏失败:', resumeError)
      }
      throw error
    }
  },
  { en: 'Failed to take screenshot', zh: '截屏失败' }
)

async function handleCloseScreenshotModal() {
  isScreenshotModalVisible.value = false

  // 恢复游戏
  try {
    const projectRunner = projectRunnerRef.value
    if (projectRunner) {
      await projectRunner.resumeGame()
      console.log('游戏已恢复')
    }
  } catch (error) {
    console.error('恢复游戏失败:', error)
  }
}

// 开始录屏
const handleStartRecording = async () => {
  if (isRecording.value) return
  
  try {
    // 复用项目中已有的登录验证逻辑
    await ensureSignedIn()
    
    isStarting.value = true
    console.log('开始录屏流程...')
    
    // 设置录屏状态
    isRecording.value = true
    console.log('录屏状态已设置为true')
    
    // 通知录屏状态管理器 - 这会触发绿边显示
    recordingStore.startRecording()
    console.log('recordingStore状态已更新，绿边应该显示')
    
    // 获取游戏画面截图
    const screenshot = await captureScreenshot()
    
    // 开始录制整个游戏画面
    await startFullGameRecording(screenshot)
    
    console.log('录屏已开始')
  } catch (error) {
    console.error('录制启动失败:', error)
    // 如果失败，重置录屏状态
    isRecording.value = false
    recordingStore.stopRecording()
    // 显示错误提示
    console.error('开始录屏失败:', error)
  } finally {
    isStarting.value = false
  }
}

// 停止录屏 - 显示分享弹窗
const handleStopRecording = async () => {
  if (!isRecording.value) return
  
  try {
    isStopping.value = true
    console.log('开始停止录制...')
    
    // 1. 停止MediaRecorder
    if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
      mediaRecorder.value.stop()
      console.log('MediaRecorder已停止')
    }
    
    // 2. 重置状态
    isRecording.value = false
    
    // 3. 通知录屏状态管理器 - 这会移除绿边
    recordingStore.stopRecording()
    console.log('recordingStore状态已更新，绿边应该移除')
    
    // 4. 停止计时器
    if (recordingTimer) {
      clearInterval(recordingTimer)
      recordingTimer = null
    }
    
    // 5. 停止绘制循环
    if (currentAnimationId) {
      cancelAnimationFrame(currentAnimationId)
      currentAnimationId = null
      console.log('绘制循环已停止')
    }
    
    // 6. 设置录屏完成状态
    hasRecording.value = true
    
    // 7. 显示录屏完成弹框
    showRecordingModal.value = true
    
    console.log('录制完全停止，状态已重置，弹窗已显示')
  } catch (error) {
    console.error('停止录制失败:', error)
  } finally {
    isStopping.value = false
  }
}

// 录屏按钮点击处理 - 简化逻辑
const handleRecord = async () => {
  if (!isRecording.value) {
    await handleStartRecording()
  }
}

// 处理录屏开始事件 - 隐藏弹窗
const handleRecordingStarted = () => {
  console.log('录屏开始事件触发，隐藏弹窗')
  showRecordingModal.value = false
}

// 处理录屏停止事件 - 显示弹窗
const handleRecordingStopped = () => {
  console.log('录屏停止事件触发，显示弹窗')
  showRecordingModal.value = true
}

// 处理重新录制事件（弹窗re-record按钮）
function handleReRecordFromModal() {
  // 重置状态
  hasRecording.value = false
  recordedVideoUrl.value = null
  showRecordingModal.value = false
  
  // 延迟一下再开始录制，确保弹窗完全关闭
  setTimeout(() => {
    handleRecord()
  }, 300)
}

// 获取游戏画面截图的函数
const captureScreenshot = async () => {
  try {
    console.log('开始获取游戏画面截图...')
    
    // 检查项目运行器是否可用
    if (!projectRunnerRef.value) {
      throw new Error('项目运行器不可用')
    }
    
    // 暂停游戏以确保画面稳定
    await projectRunnerRef.value.pauseGame()
    console.log('游戏已暂停，准备获取截图')
    
    // 使用项目运行器的截图方法直接从游戏canvas获取
    const screenshot = await projectRunnerRef.value.takeScreenshot()
    if (!screenshot) {
      throw new Error('截图方法返回空结果')
    }
    
    console.log('成功从游戏canvas获取截图', screenshot.width, 'x', screenshot.height)
    
    // 恢复游戏
    await projectRunnerRef.value.resumeGame()
    console.log('游戏已恢复')
    
    return screenshot
  } catch (error) {
    console.error('获取游戏画面截图失败:', error)
    throw error
  }
}

// 开始完整游戏录制
const startFullGameRecording = async (screenshot: any) => {
  try {
    console.log('开始完整游戏录制')
    
    // 更新状态
    isRecording.value = true
    
    console.log('录屏状态已更新:', { isRecording: isRecording.value })
    
    // 开始录制整个游戏画面
    const recorder = await startGameRecording(screenshot)
    mediaRecorder.value = recorder
    
    console.log('游戏录制已开始')
  } catch (error) {
    console.error('开始游戏录制失败:', error)
    // 如果录制失败，重置状态
    isRecording.value = false
    throw error
  }
}

// 游戏录制核心函数
const startGameRecording = async (screenshot: any) => {
  try {
    console.log('开始游戏录制')
    
    // 检查项目运行器是否可用
    if (!projectRunnerRef.value) {
      throw new Error('项目运行器不可用')
    }
    
    // 清理之前的绘制循环（如果有）
    if (currentAnimationId) {
      cancelAnimationFrame(currentAnimationId)
      currentAnimationId = null
    }
    
    // 创建canvas用于录制
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    // 设置canvas尺寸为游戏画面大小
    canvas.width = screenshot.width
    canvas.height = screenshot.height
    
    // 开始绘制循环
    const drawFrame = async () => {
      if (!isRecording.value) {
        console.log('录制已停止，停止绘制循环')
        return
      }
      
      try {
        // 直接从游戏canvas获取当前帧
        const screenshot = await projectRunnerRef.value!.takeScreenshot()
        if (!screenshot) {
          console.warn('获取游戏画面失败，跳过当前帧')
          currentAnimationId = requestAnimationFrame(drawFrame)
          return
        }
        
        // 加载截图到临时image
        const img = new Image()
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error('图片加载失败'))
          img.src = screenshot.dataURL
        })
        
        // 将整个游戏画面绘制到canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        currentAnimationId = requestAnimationFrame(drawFrame)
      } catch (error) {
        console.error('绘制帧时出错:', error)
        // 如果绘制出错，继续下一帧而不是停止录制
        currentAnimationId = requestAnimationFrame(drawFrame)
      }
    }
    
    // 开始绘制循环
    drawFrame()
    
    // 从canvas获取录制流
    const recordingStream = canvas.captureStream(30) // 30fps
    console.log('Canvas录制流已创建，帧率: 30fps')
    
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
      console.log('游戏录制停止，开始生成视频文件')
      
      // 停止绘制循环
      if (currentAnimationId) {
        cancelAnimationFrame(currentAnimationId)
        currentAnimationId = null
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
      
      console.log('视频文件已生成，URL:', url)
      
      // 直接调用弹窗组件的createRecord方法，确保能正确创建record
      if (recordingModalRef.value) {
        // 使用setTimeout确保状态更新完成后再调用
        setTimeout(async () => {
          try {
            console.log('录屏完成后，直接调用弹窗组件的createRecord方法...')
            await recordingModalRef.value!.createRecord()
            console.log('Record创建成功，后端已接收到录屏数据')
          } catch (error) {
            console.error('录屏完成后调用createRecord方法失败:', error)
          }
        }, 100)
      } else {
        console.warn('弹窗组件引用不存在，无法创建Record')
      }
    }
    
    recorder.onerror = (event) => {
      console.error('MediaRecorder录制出错:', event)
    }
    
    recorder.onstart = () => {
      console.log('MediaRecorder已开始录制')
    }
    
    // 开始录制
    recorder.start(1000) // 每秒生成一个数据块
    console.log('游戏录制已开始，MediaRecorder状态:', recorder.state)
    
    // 开始计时
    recordingTime.value = 0
    recordingTimer = setInterval(() => {
      recordingTime.value++
    }, 1000)
    
    return recorder
  } catch (error) {
    console.error('游戏录制失败:', error)
    throw error
  }
}

// 格式化时间
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 清理录屏资源
onUnmounted(() => {
  if (recordingTimer) {
    clearInterval(recordingTimer)
  }
  if (currentAnimationId) {
    cancelAnimationFrame(currentAnimationId)
  }
  if (recordedVideoUrl.value) {
    URL.revokeObjectURL(recordedVideoUrl.value)
  }
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    try {
      mediaRecorder.value.stop()
    } catch (error) {
      console.warn('组件卸载时停止MediaRecorder出错:', error)
    }
  }
})

const handlePublish = useMessageHandle(
  // there may be no thumbnail for some projects (see details in https://github.com/goplus/builder/issues/1025),
  // to ensure thumbnail for project-release, we jump to editor where we are able to generate thumbnails and then finish publishing
  async () => router.push(getOwnProjectEditorRoute(props.name, true)),
  { en: 'Failed to publish project', zh: '发布项目失败' },
  undefined
)

const removeProject = useRemoveProject()
const handleRemove = useMessageHandle(
  async () => {
    await removeProject(props.owner, props.name)
    await router.push(getUserPageRoute(getSignedInUsername()!, 'projects'))
  },
  { en: 'Failed to remove project', zh: '删除项目失败' },
  { en: 'Project removed', zh: '项目已删除' }
)

const isDesktopLarge = useResponsive('desktop-large')
const isMobile = useResponsive('mobile')
const remixNumInRow = computed(() => (isDesktopLarge.value ? 6 : 5))

const remixesRet = useQuery(
  async () => {
    const { data: projects } = await listProject({
      visibility: Visibility.Public,
      owner: ownerAll,
      remixedFrom: stringifyRemixSource(props.owner, props.name),
      pageIndex: 1,
      pageSize: remixNumInRow.value,
      orderBy: 'likeCount',
      sortOrder: 'desc'
    })
    return projects
  },
  { en: 'Failed to load projects', zh: '加载失败' }
)
</script>

<template>
  <CenteredWrapper size="large">
    <CommunityCard
      v-radar="{ name: 'Project content', desc: 'Main content area for project details and runner' }"
      class="main"
    >
      <UILoading v-if="isLoading" cover mask="solid" />
      <UIError v-else-if="error != null" class="error" :retry="reloadProject">
        {{ $t(error.userMessage) }}
      </UIError>
      <div class="left">
        <div class="project-wrapper">
          <template v-if="project != null">
            <ProjectRunner ref="projectRunnerRef" :key="`${project.owner}/${project.name}`" :project="project" />
            <div v-show="runnerState === 'initial'" class="runner-mask">
              <UIButton
                v-radar="{ name: 'Run button', desc: 'Click to run the project' }"
                class="run-button"
                type="primary"
                size="large"
                icon="playHollow"
                :disabled="projectRunnerRef == null"
                :loading="handleRun.isLoading.value"
                @click="handleRun.fn"
                >{{ $t({ en: 'Run', zh: '运行' }) }}</UIButton
              >
            </div>
          </template>
        </div>
        <FullScreenProjectRunner
          v-if="project != null"
          :project="project"
          :visible="isFullScreenRunning"
          @close="isFullScreenRunning = false"
        />
        <div class="ops">
          <UIButton
            v-if="runnerState === 'running'&&!isMobile"
            v-radar="{ name: 'Screenshot button', desc: 'Click to take a screenshot' }"
            type="boring"
            :loading="handleScreenshot.isLoading.value"
            @click="handleScreenshot.fn"
          >
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="4" width="12" height="8" rx="1" stroke="currentColor" stroke-width="1.5" fill="none" />
                <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5" fill="none" />
                <path
                  d="M6 4L6.5 2.5A1 1 0 0 1 7.5 2h1A1 1 0 0 1 9.5 2.5L10 4"
                  stroke="currentColor"
                  stroke-width="1.5"
                  fill="none"
                />
              </svg>
            </template>
            {{ $t({ en: 'Screenshot', zh: '截屏' }) }}
          </UIButton>

          <!-- Record按钮 - 根据录屏状态显示不同按钮 -->
          <UIButton
            v-if="runnerState === 'running' && !isMobile && !isRecording"
            v-radar="{ name: 'Record button', desc: 'Click to start recording' }"
            type="primary"
            :loading="isStarting"
            @click="handleRecord"
          >
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.5" fill="none" />
                <circle cx="8" cy="8" r="2" fill="currentColor" />
                <circle cx="12" cy="6" r="1" fill="currentColor" />
              </svg>
            </template>
            {{ $t({ en: 'Record', zh: '录屏' }) }}
          </UIButton>
          
          <!-- Stop-Recording按钮 - 录屏中显示 -->
          <UIButton
            v-if="runnerState === 'running' && !isMobile && isRecording"
            v-radar="{ name: 'Stop recording button', desc: 'Click to stop recording' }"
            type="danger"
            :loading="isStopping"
            @click="handleStopRecording"
          >
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="4" width="4" height="8" fill="currentColor" />
              </svg>
            </template>
            {{ $t({ en: 'Stop-Recording', zh: '停止录屏' }) }}
          </UIButton>
          
          <!-- 录屏状态显示 -->
          <div v-if="isRecording" class="recording-status">
            <div class="recording-indicator">
              <div class="red-dot"></div>
              {{ $t({ en: 'Recording...', zh: '录制中...' }) }}
            </div>
            <div class="recording-time">{{ formatTime(recordingTime) }}</div>
          </div>
          <UIButton
            v-if="runnerState === 'initial'"
            v-radar="{ name: 'Full screen run button', desc: 'Click to run project in full screen' }"
            type="primary"
            icon="fullScreen"
            @click="isFullScreenRunning = true"
          >
            {{ $t({ en: 'Run in full screen', zh: '全屏运行' }) }}
          </UIButton>
          <UIButton
            v-if="runnerState === 'running'"
            v-radar="{ name: 'Rerun button', desc: 'Click to rerun the project' }"
            type="primary"
            icon="rotate"
            :disabled="projectRunnerRef == null"
            :loading="handleRerun.isLoading.value"
            @click="handleRerun.fn"
          >
            {{ $t({ en: 'Rerun', zh: '重新运行' }) }}
          </UIButton>
          <UIButton
            v-if="runnerState === 'running'"
            v-radar="{ name: 'Stop button', desc: 'Click to stop the running project' }"
            type="boring"
            icon="end"
            @click="handleStop.fn"
          >
            {{ $t({ en: 'Stop', zh: '停止' }) }}
          </UIButton>
          <UITooltip v-if="!isMobile">
            <template #trigger>
              <UIButton
                v-radar="{ name: 'Share button', desc: 'Click to share the project' }"
                type="boring"
                icon="share"
                @click="handleShare.fn"
              ></UIButton>
            </template>
            {{ $t({ en: 'Share', zh: '分享' }) }}
          </UITooltip>
        </div>
      </div>
      <div class="right">
        <template v-if="project != null">
          <h2 class="title">{{ project.name }}</h2>
          <RemixedFrom v-if="project.remixedFrom != null" class="remixed-from" :remixed-from="project.remixedFrom" />
          <div class="info">
            <OwnerInfo :owner="project.owner!" />
            <p class="extra">
              <span class="part" :title="$t(viewCount!.title)">
                <UIIcon class="icon" type="eye" />
                {{ $t(viewCount!.text) }}
              </span>
              <template v-if="isOwner">
                <i class="sep"></i>
                <span class="part" :title="$t(likeCount!.title)">
                  <UIIcon class="icon" type="heart" />
                  {{ $t(likeCount!.text) }}
                </span>
              </template>
              <i class="sep"></i>
              <span class="part" :title="$t(remixCount!.title)">
                <UIIcon class="icon" type="remix" />
                {{ $t(remixCount!.text) }}
              </span>
            </p>
          </div>
          <div class="ops">
            <template v-if="isOwner">
              <UIButton
                v-radar="{ name: 'Edit button', desc: 'Click to edit the project' }"
                type="primary"
                size="large"
                icon="edit2"
                :loading="handleEdit.isLoading.value"
                @click="handleEdit.fn"
                >{{ $t({ en: 'Edit', zh: '编辑' }) }}</UIButton
              >
              <UIButton
                v-if="project.visibility === Visibility.Public && !isMobile"
                v-radar="{ name: 'Share button', desc: 'Click to share the project' }"
                type="boring"
                size="large"
                icon="share"
                @click="handleShare.fn"
                >{{ $t({ en: 'Share', zh: '分享' }) }}</UIButton
              >
              <UIButton
                v-else
                v-radar="{ name: 'Publish button', desc: 'Click to publish the project' }"
                type="boring"
                size="large"
                icon="share"
                :loading="handlePublish.isLoading.value"
                @click="handlePublish.fn"
                >{{ $t({ en: 'Publish', zh: '发布' }) }}</UIButton
              >
              <UIDropdown placement="bottom-end" trigger="click">
                <template #trigger>
                  <UIButton
                    v-radar="{ name: 'More options button', desc: 'Click to see more project options' }"
                    class="more"
                    type="boring"
                    size="large"
                    icon="more"
                  ></UIButton>
                </template>
                <UIMenu>
                  <UIMenuItem
                    v-if="project.visibility === Visibility.Public"
                    v-radar="{ name: 'Unpublish option', desc: 'Click to unpublish the project' }"
                    @click="handleUnpublish.fn"
                    >{{ $t({ en: 'Unpublish', zh: '取消发布' }) }}</UIMenuItem
                  >
                  <UIMenuItem
                    v-radar="{ name: 'Remove option', desc: 'Click to remove the project' }"
                    @click="handleRemove.fn"
                    >{{ $t({ en: 'Remove', zh: '删除' }) }}</UIMenuItem
                  >
                </UIMenu>
              </UIDropdown>
            </template>
            <template v-else>
              <UIButton
                v-if="hasRelease && !isMobile"
                v-radar="{ name: 'Remix button', desc: 'Click to remix this project' }"
                type="primary"
                size="large"
                icon="remix"
                :loading="handleRemix.isLoading.value"
                @click="handleRemix.fn"
                >{{ $t({ en: 'Remix', zh: '改编' }) }}</UIButton
              >
              <UIButton
                v-radar="{ name: 'Like button', desc: 'Click to like or unlike the project' }"
                :class="{ liking }"
                type="boring"
                size="large"
                :title="$t(likeCount!.title)"
                :icon="liking ? 'heart' : 'heartHollow'"
                :loading="isTogglingLike"
                @click="handleToggleLike"
              >
                {{ $t(likeCount!.text) }}
              </UIButton>
              <UIButton
              
                v-radar="{ name: 'Share button', desc: 'Click to share the project' }"
                type="boring"
                size="large"
                icon="share"
                @click="handleShare.fn"
                >{{ $t({ en: 'Share', zh: '分享' }) }}</UIButton
              >
            </template>
          </div>
          <UIDivider class="divider" />
          <UICollapse
            v-radar="{
              name: 'Project details',
              desc: 'Collapsible sections showing project description, instructions and release history'
            }"
            class="collapse"
            :default-expanded-names="['description', 'instructions', 'releases']"
          >
            <UICollapseItem :title="$t({ en: 'Description', zh: '描述' })" name="description">
              <TextView :text="project.description" :placeholder="$t({ en: 'No description yet', zh: '暂无描述' })" />
            </UICollapseItem>
            <UICollapseItem :title="$t({ en: 'Play instructions', zh: '操作说明' })" name="instructions">
              <TextView
                :text="project.instructions"
                :placeholder="$t({ en: 'No instructions yet', zh: '暂无操作说明' })"
              />
            </UICollapseItem>
            <UICollapseItem :title="$t({ en: 'Release history', zh: '发布历史' })" name="releases">
              <ReleaseHistory :query-ret="releasesRet" />
            </UICollapseItem>
          </UICollapse>
        </template>
      </div>
    </CommunityCard>
    <ProjectsSection
      v-radar="{ name: 'Popular remixes section', desc: 'Section showing popular remixes of this project' }"
      class="remixes"
      context="project"
      :num-in-row="remixNumInRow"
      :query-ret="remixesRet"
    >
      <template #title>
        {{
          $t({
            en: 'Popular remixes',
            zh: '热门改编'
          })
        }}
      </template>
      <ProjectItem v-for="remix in remixesRet.data.value" :key="remix.id" :project="remix" />
    </ProjectsSection>
    <RecordingShareModal
      ref="recordingModalRef"
      v-if="project != null"
      :visible="showRecordingModal"
      :project-name="project.name"
      :project-thumbnail="thumbnailUrl || undefined"
      :project-runner="projectRunnerRef"
      :project-id="project.id"
      :owner="project.owner"
      :recorded-video-url="recordedVideoUrl"
      :has-recording="hasRecording"
      @cancelled="showRecordingModal = false"
      @resolved="showRecordingModal = false"
      @recording-started="handleRecordingStarted"
      @recording-stopped="handleRecordingStopped"
      @re-record="handleReRecordFromModal"
    />
  </CenteredWrapper>

  <!-- 截屏分享弹窗 -->
  <ScreenshotShareModal
    v-model:visible="isScreenshotModalVisible"
    :screenshot-data-url="screenshotDataUrl"
    :screenshot-width="screenshotWidth"
    :screenshot-height="screenshotHeight"
    :project-name="props.name"
    :creator-name="props.owner"
    :project-description="project?.description"
    :project-stats="{
      viewCount: project?.viewCount,
      likeCount: project?.likeCount,
      remixCount: project?.remixCount
    }"
    @close="handleCloseScreenshotModal"
  />
  
  <!-- 移动端分享提示蒙版 -->
  <div
    v-if="showMobileShareHint"
    class="mobile-share-hint-overlay"
    @click="closeMobileShareHint"
  >
    <div class="mobile-share-hint-content">
      <div class="hint-arrow">
        <UIIcon class="icon"  type="arrowShare" />
      </div>
      <div class="hint-text">
        {{ $t({ en: 'please click the upper right button to send it to the designated friend', zh: '请点击右上角将它发送给指定朋友' }) }}
      </div>
    </div>
  </div>
  
  <!-- QQ环境调试信息显示 -->
  <!-- <div
    v-if="showDebugInfo"
    class="debug-info-overlay"
    @click="showDebugInfo = false"
  >
    <div class="debug-info-content">
      <div class="debug-header">
        <span>QQ环境调试信息</span>
        <button class="close-btn" @click="showDebugInfo = false">×</button>
      </div>
      <div class="debug-body">
        <pre>{{ debugInfo }}</pre>
      </div>
    </div>
  </div> -->
</template>

<style scoped lang="scss">
@import '@/components/ui/responsive.scss';
.error {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: var(--ui-color-grey-100);
}

.main {
  position: relative;
  flex: 0 0 auto;
  margin-top: 24px;
  padding: 20px;
  display: flex;
  gap: 40px;
  background: var(--ui-color-grey-100);
  @include responsive(mobile) {
    flex-direction: column;
    gap: 20px;
  }
}

.left {
  flex: 1 1 744px;
  @include responsive(mobile){
    flex: 1 1 0;
  }
  .project-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: var(--ui-border-radius-1);
    overflow: hidden;

    .runner-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: var(--ui-border-radius-1);
      background: rgba(87, 96, 106, 0.2);
      backdrop-filter: blur(5px);
    }

    .run-button {
      width: 160px;
    }
  }

  .ops {
    margin-top: 12px;
    display: flex;
    gap: var(--ui-gap-middle);
    justify-content: flex-end;
  }
}

.right {
  flex: 1 1 456px;
  min-width: 0;
  padding-right: 20px;
  display: flex;
  flex-direction: column;

  .title {
    font-size: 20px;
    line-height: 1.4;
    color: var(--ui-color-title);
    word-break: break-all;
  }

  .remixed-from {
    margin-top: 8px;
  }

  .info {
    margin-top: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .extra {
      display: flex;
      align-items: center;
      gap: 8px;

      .part {
        display: flex;
        gap: 4px;
        align-items: center;
        color: var(--ui-color-hint-2);
      }

      .icon {
        width: 14px;
        height: 14px;
      }

      .sep {
        width: 1px;
        height: 12px;
        background-color: var(--ui-color-dividing-line-1);
      }
    }
  }

  .ops {
    margin-top: 16px;
    display: flex;
    gap: 12px;

    & > * {
      flex: 1 1 0;

      &.more {
        flex: 0 0 auto;
        width: 40px;
        :deep(.content) {
          padding: 0;
        }
      }
    }

    .liking :deep(.content) {
      color: var(--ui-color-red-main);
    }
  }

  .divider {
    margin: 24px 0 16px;
  }

  .collapse {
    margin-bottom: 8px;
    flex: 1 1 0;
    overflow-y: auto;
  }
}

.remixes {
  margin-top: 20px;
}

/* 移动端分享提示蒙版样式 */
.mobile-share-hint-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: right;
  color: #fff;
  
  @include responsive(mobile) {
    .mobile-share-hint-content {  
      padding: 0 24px;
      text-align: center;
      max-width: 280px;
          .hint-arrow {
          margin: 25px 0;
          display: flex;
          justify-content: right;
        
          .icon {
            transform: scale(4); 
          }
        }
      .hint-text {
        font-size: 16px;
        margin-bottom: 20px;
        line-height: 1.4;
      }
    }
  }
}

/* QQ环境调试信息样式 */
.debug-info-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.debug-info-content {
  background: white;
  border-radius: 8px;
  max-width: 90%;
  max-height: 80%;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.debug-header {
  background: #f0f0f0;
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #000;
  }
}

.debug-body {
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
  
  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: monospace;
    font-size: 12px;
    line-height: 1.4;
    color: #333;
  }
}

/* 录屏状态样式 */
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
  0%, 100% {
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
</style>

