<script setup lang="ts">
import { computed } from 'vue'
import { usePageTitle } from '@/utils/utils'
import { getSignedInUsername, useUser } from '@/stores/user'
import { UIButton } from '@/components/ui'
import UserContent from '@/components/community/user/content/UserContent.vue'
import VideoItem from '@/components/video/VideoItem.vue'
import { getMockVideos } from '@/mock/videoData'

const props = defineProps<{
  name: string
}>()

const isSignedInUser = computed(() => props.name === getSignedInUsername())

const { data: user } = useUser(() => props.name)
usePageTitle(() => {
  if (user.value == null) return null
  return {
    en: `Videos of ${user.value.displayName}`,
    zh: `${user.value.displayName} 的视频`
  }
})

// Use mock data for now
const videos = computed(() => getMockVideos())

const handleVideoSelected = (videoId: string) => {
  // TODO: Implement video player route
  console.log('Selected video:', videoId)
}

const createVideo = () => {
  // TODO: Implement create video functionality
  console.log('Create video')
}
</script>

<template>
  <UserContent>
    <div class="toolbar">
      <UIButton v-if="isSignedInUser" @click="createVideo">
        {{ $t({ en: 'Create video', zh: '创建视频' }) }}
      </UIButton>
    </div>
    <div v-if="videos.length" class="list">
      <VideoItem
        v-for="video in videos"
        :key="video.id"
        :video="video"
        @selected="handleVideoSelected(video.id)"
      />
    </div>
    <div v-else class="empty-message">
      <span>{{ $t({ en: 'No videos yet', zh: '暂无视频' }) }}</span>
    </div>
  </UserContent>
</template>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.empty-message {
  text-align: center;
  color: var(--ui-color-grey-500);
  padding: 40px;
  font-size: 16px;
}
</style>
