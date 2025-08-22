//传入视频文件（方便复用在项目页面和录屏页面）
defineProps<{
    setRecordingURL: string,
    recording?: File // 传的话就更快显示，内存没有不传的话就去URL上下
}>()

//传给分享平台模块的是页面URL

function onclickReRecord() {
    // 调用 RecordingAPIs 在后端软删除最近一条视频记录
    isRecording.value = true
    window.startRecording()
    showRecording.value = false
}

import from './sharePlatform'



import QRCode
