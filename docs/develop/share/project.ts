
import { createPoster } from './poster'
import { ref } from 'vue'
import ScreenShotSharing from './ScreenShotSharing.vue'
import { useQuery } from '@/composables/useQuery'
import { getProject } from '@/apis/project'
import type { ProjectData } from '@/apis/project'

const screenShotPoster = ref<File | null>(null)
const showSharing = ref(false)

const {
  data: projectData,
  isLoading,
  error,
  refetch: reloadProject
} = useQuery(
  async (ctx) => {
    return await getProject(props.owner, props.name, ctx.signal)
  },
  {
    en: 'Failed to load project',
    zh: '加载项目失败'
  }
)

const poster = ref<File | null>(null)

async function onClickScreenShot() {
    window.pauseGame()
    const screenShotFile = window.takeScreenShot()
    try {
        const screenShotPoster = await createPoster({ 
            img: screenShotFile, 
            projectData: projectData.value 
        })
        poster.value = screenShotPoster // 传入截屏海报文件
        showSharing.value = true
    } catch (error) {
    }
}

function closeSharing() {
    showSharing.value = false
    window.resumeGame()
}


//=========================================================


import ProjectRecordingSharing from './ProjectRecordingSharing.vue'

const isRecording = ref(false)
const showRecording = ref(false)
const video = ref<File | null>(null)
function onClickRecord() {
    isRecording.value = !isRecording.value
    
    if (!isRecording.value) {
        window.startRecording()
    } else {
        window.stopRecording()
        window.pauseGame()
        const recordFile = window.getRecord()
        
        video.value = recordFile // 传入视频文件
        showRecording.value = true
    }
}

function reRecord() {
    isRecording.value = true
    window.startRecording()
    showRecording.value = false
}

function closeRecording() {
    showRecording.value = false
    window.resumeGame()
    saveRecording()
}

async function saveRecording() {
    try {
        // 调用 RecordingAPIs 存储到后端
        showRecording.value = false
    } catch (error) {
    }
}
