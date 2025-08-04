import { ref } from 'vue'
import { useQuery } from '@/utils/query'
import { isLikingVideo } from '@/apis/video'

const likingRecords = ref(new Set<string>())

export function useIsLikingVideo(videoRef: () => { owner: string; name: string }) {
  return useQuery(
    async () => {
      const { owner, name } = videoRef()
      const key = `${owner}/${name}`
      if (likingRecords.value.has(key)) return true
      const result = await isLikingVideo(owner, name)
      if (result) likingRecords.value.add(key)
      return result
    },
    { en: 'Failed to check video like status', zh: '检查视频点赞状态失败' }
  )
}
