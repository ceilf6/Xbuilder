import * as qiniu from 'qiniu-js'
import { usercontentUploadBaseUrl } from '@/utils/env'
import { getUpInfo } from '@/apis/util'

export async function uploadFile(file) {
  // 获取上传token
  const upInfo = await getUpInfo()
  
  // 生成文件名
  const key = `videos/${Date.now()}-${file.name}`
  
  // 上传到七牛云
  const observable = qiniu.upload(file, key, upInfo.token, {
    fname: file.name,
    region: qiniu.region.z0 // 根据你的区域调整
  })
  
  return new Promise((resolve, reject) => {
    observable.subscribe({
      next: (res) => {
        console.log('上传进度:', res.total.percent)
      },
      error: (err) => {
        reject(err)
      },
      complete: (res) => {
        const url = `${usercontentUploadBaseUrl}/${res.key}`
        resolve({ url, key: res.key })
      }
    })
  })
}