<template>
  <div class="record-page">
    <CenteredWrapper>
      <!-- Loading State -->
      <UILoading v-if="isLoading" :mask="false" />

      <!-- Error State -->
      <UIError v-else-if="error" :retry="refetch">
        {{ $t(error.userMessage) }}
      </UIError>

      <!-- Record Content -->
      <div v-else-if="record" class="record-content">
        <!-- Header Section -->
        <div class="record-header">
          <div class="record-info">
            <h1 class="record-title">{{ record.title }}</h1>
            <div class="record-meta">
              <UserAvatar class="owner-avatar" :user="record.owner" size="medium" />
              <div class="meta-info">
                <RouterLink :to="getUserPageRoute(record.owner)" class="owner-name">
                  {{ record.owner }}
                </RouterLink>
                <div class="stats">
                  <span class="stat-item">
                    <UIIcon type="eye" />
                    {{ $t(humanizeCount(record.viewCount)) }} 观看
                  </span>
                  <span class="stat-item">
                    <UIIcon type="heart" />
                    {{ $t(humanizeCount(record.likeCount)) }} 喜欢
                  </span>
                  <span class="stat-item">
                    {{ $t(humanizeTime(record.updatedAt)) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="record-actions">
            <UIButton v-if="record.project" type="primary" @click="handleViewProject">
              <UIIcon type="play" />
              {{ $t({ en: 'View Project', zh: '查看项目' }) }}
            </UIButton>
            <UIButton v-if="isOwner" type="boring" @click="handleEdit">
              <UIIcon type="edit" />
              {{ $t({ en: 'Edit', zh: '编辑' }) }}
            </UIButton>
          </div>
        </div>

        <!-- Video Player Section -->
        <div class="video-section">
          <div class="video-container">
            <video
              ref="videoRef"
              class="video-player"
              :src="record.videoUrl"
              :poster="thumbnailUrl"
              controls
              preload="metadata"
              @loadedmetadata="handleVideoLoaded"
            >
              您的浏览器不支持视频播放。
            </video>
          </div>
          <div class="video-info">
            <p class="duration">时长: {{ formatDuration(record.duration) }}</p>
            <p class="file-size">文件大小: {{ formatFileSize(record.fileSize) }}</p>
          </div>
        </div>

        <!-- Description Section -->
        <div v-if="record.description" class="description-section">
          <h3>{{ $t({ en: 'Description', zh: '描述' }) }}</h3>
          <p class="description">{{ record.description }}</p>
        </div>

        <!-- Associated Project Section -->
        <div v-if="record.project" class="project-section">
          <h3>{{ $t({ en: 'Associated Project', zh: '关联项目' }) }}</h3>
          <div class="project-card">
            <ProjectItem :project="record.project" context="public" />
          </div>
        </div>
      </div>
    </CenteredWrapper>
  </div>
</template>
  
  <script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePageTitle } from '@/utils/utils'
import { useQuery } from '@/utils/query'
import { humanizeCount, humanizeTime, useAsyncComputed } from '@/utils/utils'
import { getProjectPageRoute, getUserPageRoute } from '@/router'
import { getSignedInUsername } from '@/stores/user'
import { createFileWithUniversalUrl } from '@/models/common/cloud'
import { UILoading, UIError, UIButton, UIIcon } from '@/components/ui'
import UserAvatar from '@/components/community/user/UserAvatar.vue'
import CenteredWrapper from '@/components/community/CenteredWrapper.vue'
import ProjectItem from '@/components/project/ProjectItem.vue'

import { getRecord, recordRecordView } from '@/apis/record'

const props = defineProps<{
  owner: string
  name: string
}>()

const router = useRouter()
const videoRef = ref<HTMLVideoElement>()

// 使用真实的API获取record数据
const {
  data: record,
  isLoading,
  error,
  refetch
} = useQuery(
  async (ctx) => {
    const recordData = await getRecord(props.owner, props.name, ctx.signal)
    return recordData
  },
  {
    en: 'Failed to load record',
    zh: '加载录屏失败'
  }
)

// 页面标题
usePageTitle(() => {
  if (!record.value) return null
  return {
    en: `${record.value.title} - ${record.value.owner}`,
    zh: `${record.value.title} - ${record.value.owner}`
  }
})

// 是否为录屏所有者
const isOwner = computed(() => {
  return record.value?.owner === getSignedInUsername()
})

// 缩略图URL
const thumbnailUrl = useAsyncComputed(async (onCleanup) => {
  if (!record.value?.thumbnailUrl) return null
  const thumbnail = createFileWithUniversalUrl(record.value.thumbnailUrl)
  return thumbnail.url(onCleanup)
})

// 格式化时长
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 查看关联项目
function handleViewProject() {
  if (record.value?.project) {
    router.push(getProjectPageRoute(record.value.project.owner, record.value.project.name))
  }
}

// 编辑录屏
function handleEdit() {
  // TODO: 实现录屏编辑功能
  console.log('Edit record:', props.name)
}

// 视频加载完成 - 记录观看次数
function handleVideoLoaded() {
  console.log('Video loaded')
  if (record.value) {
    recordRecordView(record.value.owner, record.value.name).catch(console.error)
  }
}

onMounted(() => {
  // 页面加载时记录观看次数
  if (record.value) {
    recordRecordView(record.value.owner, record.value.name).catch(console.error)
  }
})
</script>
  
  <style lang="scss" scoped>
.record-page {
  padding: 20px 0;
  min-height: 100vh;
}

.record-content {
  max-width: 1200px;
  margin: 0 auto;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 20px;
}

.record-info {
  flex: 1;
}

.record-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--ui-color-grey-900);
}

.record-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.owner-avatar {
  flex-shrink: 0;
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.owner-name {
  font-weight: 500;
  color: var(--ui-color-primary-main);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--ui-color-grey-600);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.record-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.video-section {
  margin-bottom: 32px;
}

.video-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto 16px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-player {
  width: 100%;
  height: auto;
  display: block;
}

.video-info {
  display: flex;
  justify-content: center;
  gap: 24px;
  font-size: 14px;
  color: var(--ui-color-grey-600);
}

.description-section {
  margin-bottom: 32px;
}

.description-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--ui-color-grey-900);
}

.description {
  font-size: 16px;
  line-height: 1.6;
  color: var(--ui-color-grey-700);
  white-space: pre-wrap;
}

.project-section {
  margin-bottom: 32px;
}

.project-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--ui-color-grey-900);
}

.project-card {
  max-width: 232px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .record-header {
    flex-direction: column;
    align-items: stretch;
  }

  .record-title {
    font-size: 24px;
  }

  .stats {
    flex-wrap: wrap;
  }

  .video-info {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
}
</style>