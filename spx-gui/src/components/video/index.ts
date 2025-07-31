import { useMessageHandle } from '@/utils/exception'
import { deleteVideo } from '@/apis/video'

export function useRemoveVideo() {
  return useMessageHandle(
    async (owner: string, name: string) => {
      await deleteVideo(owner, name)
    },
    { en: 'Failed to remove video', zh: '删除视频失败' },
    { en: 'Video removed', zh: '视频已删除' }
  ).fn
}
