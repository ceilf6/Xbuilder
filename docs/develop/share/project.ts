
import { createPoster } from './poster'
import { ref } from 'vue'
import ScreenShotSharing from './ScreenShotSharing.vue'
import { useQuery } from '@/composables/useQuery'
import { getProject } from '@/apis/project'
import type { ProjectData } from '@/apis/project'

const screenShotPoster = ref<File | null>(null)
const showScreenShotSharing = ref(false)

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
        showScreenShotSharing.value = true
    } catch (error) {
    }
}

function closeScreenShotSharing() {
    showScreenShotSharing.value = false
    window.resumeGame()
}


//=========================================================


import ProjectRecordingSharing from './ProjectRecordingSharing.vue'
import type { CreateRecordParams } from './module_RecordingApis'
import { RecordService } from './module_RecordingApis'
import { saveFile } from '@/models/common/cloud'

const isRecording = ref(false)
const showRecordSharing = ref(false)
const setRecordingURL = ref<string | null>(null)
const recording = ref<File | null>(null)

async function onClickRecord() {
    isRecording.value = !isRecording.value
    
    if (!isRecording.value) {
        window.startRecording()
    } else {
        window.stopRecording()
        window.pauseGame()
        const recordFile = window.getRecordedVideo()

        const RecordingURL = await saveFile(recordFile) // 存储到云端获得视频存储URL
        const params: CreateRecordParams = {
            projectFullName: `${projectData.value.owner}/${projectData.value.name}`,
            title: projectData.value.name,
            description: projectData.value.description ?? '',
            videoUrl: RecordingURL,
            thumbnailUrl: projectData.value.thumbnail || ''
        }

        const created = await RecordingURL.createRecord(params) // 1.调用 RecordingAPIs 存储到后端
        const gotRecordID = created.id// 2.调用 RecordingAPIs 获取视频存储ID
        const gotshowRecordingURL = `{created}` // 3.拼接ID 获得录屏展示页面的 URL 传给录屏展示模块
        setRecordingURL.value = gotshowRecordingURL
        showRecordSharing.value = true // 4.唤起录屏分享弹窗
        recording.value = recordFile // 同时异步传入视频文件
    }
}

function closeRecordSharing() {
    showRecording.value = false
    window.resumeGame()
}