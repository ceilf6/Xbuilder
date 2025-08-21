/**
 * 获取视频文件的时长
 * @param videoUrl 视频URL
 * @returns Promise<number> 时长（秒）
 */
export function getVideoDuration(videoUrl: string): Promise<number> {
    return new Promise((resolve, reject) => {
      // 创建临时的video元素
      const video = document.createElement('video')
      
      // 设置crossOrigin以支持跨域视频
      video.crossOrigin = 'anonymous'
      video.preload = 'metadata' // 只加载元数据，不加载完整视频
      
      // 监听元数据加载完成
      video.addEventListener('loadedmetadata', () => {
        resolve(video.duration)
        // 清理
        video.remove()
      })
      
      // 监听错误
      video.addEventListener('error', () => {
        reject(new Error('Failed to load video metadata'))
        video.remove()
      })
      
      // 设置视频源并开始加载
      video.src = videoUrl
    })
  }
  
  /**
   * 格式化视频时长显示
   * @param seconds 秒数
   * @returns 格式化的时长字符串 (如: "1:23", "12:34")
   */
  export function formatDuration(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00'
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }