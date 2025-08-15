<template>
  <div class="record-page">
    <UILoading v-if="isLoading" />
    <UIError v-else-if="error != null" class="error" :retry="refetch">
      {{ $t(error.userMessage) }}
    </UIError>
    <CenteredWrapper v-else-if="record" class="record-wrapper" size="large">
      <!-- Main Content Frame - 上方框：左侧视频 + 右侧信息 -->
      <div class="main-content-frame">
        <div class="content-layout">
          <!-- Left Side - Video Player -->
          <div class="video-side">
            <div class="video-container">
              <video 
                ref="videoRef"
                :src="videoUrl" 
                :poster="thumbnailUrl || ''"
                controls
                preload="metadata"
                crossorigin="anonymous"
                @loadedmetadata="handleVideoLoaded"
                @play="handleVideoPlay"
              >
                {{ $t({ en: 'Your browser does not support video playback.', zh: '您的浏览器不支持视频播放。' }) }}
              </video>
            </div>
          </div>

          <!-- Right Side - Info Panel -->
          <div class="info-side">
            <!-- Record Title -->
            <h1 class="record-title">{{ record.title }}</h1>
            
            <!-- Stats -->
            <div class="record-stats">
              <div class="stat-item">
                <UIIcon type="eye" />
                <span>0</span>
              </div>
              <div class="stat-item">
                <UIIcon type="heart" />
                <span>0</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <UIButton 
                v-if="record.project"
                type="primary" 
                size="large"
                @click="handlePlayProject"
              >
                <UIIcon type="play" />
                {{ $t({ en: 'Play Game', zh: '一键开玩' }) }}
              </UIButton>
              <UIButton 
                type="secondary" 
                size="medium"
                @click="handleLike"
              >
                <UIIcon type="heart" />
                0
              </UIButton>
              <UIButton 
                type="secondary" 
                size="medium"
                @click="handleShare"
              >
                <UIIcon type="share" />
                {{ $t({ en: 'Share', zh: '分享' }) }}
              </UIButton>
            </div>

            <!-- Owner Info -->
            <div class="owner-section">
              <div class="owner-info">
                <UserAvatar :user="record.owner" size="medium" />
                <div class="owner-details">
                  <RouterUILink :to="getUserPageRoute(record.owner)">
                    <span class="owner-name">{{ record.owner }}</span>
                  </RouterUILink>
                  <span class="created-time">{{ $t(humanizeTime(record.createdAt)) }}</span>
                </div>
              </div>
            </div>

            <!-- Project Description -->
            <div v-if="record.project" class="description-section">
              <h3>{{ $t({ en: 'Game Description', zh: '游戏描述' }) }}</h3>
              <p class="description-text">{{ record.project.description || $t({ en: 'No description available', zh: '暂无描述' }) }}</p>
              <div class="project-link">
                <RouterUILink :to="getProjectPageRoute(record.project.owner, record.project.name)">
                  {{ $t({ en: 'View Project', zh: '查看项目' }) }} →
                </RouterUILink>
              </div>
            </div>

            <!-- Record Description -->
            <div v-if="record.description" class="description-section">
              <h3>{{ $t({ en: 'Recording Description', zh: '录屏描述' }) }}</h3>
              <p class="description-text">{{ record.description }}</p>
            </div>


          </div>
        </div>
      </div>

      <!-- Related Records Frame - 下方框：相关录屏 -->
      <div v-if="record.project" class="related-content-frame">
        <ProjectsSection
          context="project"
          :num-in-row="numInRow"
          :query-ret="relatedRecordsQuery"
          :link-to="allRecordsLink"
        >
          <template #title>
            {{ $t({ en: 'More recordings of this project', zh: '该项目的其他录屏' }) }}
          </template>
          <template #link>
            {{ $t({ en: 'View all', zh: '查看所有' }) }}
          </template>
          <RecordItem 
            v-for="relatedRecord in relatedRecordsQuery.data.value" 
            :key="relatedRecord.id" 
            :record="relatedRecord" 
          />
        </ProjectsSection>
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
import { getRecord, recordRecordView, listRecord, stringifyRecordFullName } from '@/apis/record'
import { UILoading, UIError, UIButton, UIIcon, useResponsive } from '@/components/ui'
import UserAvatar from '@/components/community/user/UserAvatar.vue'
import CenteredWrapper from '@/components/community/CenteredWrapper.vue'
import ProjectItem from '@/components/project/ProjectItem.vue'
import ProjectsSection from '@/components/community/ProjectsSection.vue'
import RecordItem from '@/components/record/RecordItem.vue'
import RouterUILink from '@/components/common/RouterUILink.vue'

const props = defineProps<{
  owner: string
  name: string
}>()

const router = useRouter()
const videoRef = ref<HTMLVideoElement>()

// 响应式布局
const isDesktopLarge = useResponsive('desktop-large')
const numInRow = computed(() => (isDesktopLarge.value ? 5 : 4))

// 获取record数据
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

// 视频URL转换
const convertRecordUrl = (universalUrl: string): string => {
  if (!universalUrl) return ''

  if (universalUrl.startsWith('kodo://test-xbuilder/')) {
    const filePath = universalUrl.replace('kodo://test-xbuilder/', '')
    return `http://t0zmxasek.hn-bkt.clouddn.com/${filePath}`
  }

  if (universalUrl.startsWith('http://') || universalUrl.startsWith('https://')) {
    return universalUrl
  }

  return universalUrl
}

// 视频URL处理
const videoUrl = computed(() => {
  if (!record.value?.videoUrl) return ''
  return convertRecordUrl(record.value.videoUrl)
})

// 相关录屏查询
const relatedRecordsQuery = useQuery(
  async () => {
    if (!record.value?.project) return []
    
    const projectFullName = `${record.value.project.owner}/${record.value.project.name}`
    const { data: records } = await listRecord({
      projectFullName: projectFullName,
      pageIndex: 1,
      pageSize: numInRow.value,
      orderBy: 'createdAt',
      sortOrder: 'desc'
    })
    
    // 排除当前录屏
    return records.filter(r => r.id !== record.value?.id)
  },
  {
    en: 'Failed to load related records',
    zh: '加载相关录屏失败'
  }
)

// 查看所有录屏的链接
const allRecordsLink = computed(() => {
  if (!record.value?.project) return null
  // 这里需要根据实际路由结构调整
  return `/community/project/${record.value.project.owner}/${record.value.project.name}/records`
})

// 格式化持续时间
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

// 事件处理
const handleVideoLoaded = () => {
  console.log('Video loaded')
}

const handleVideoPlay = async () => {
  // 记录观看次数
  try {
    await recordRecordView(props.owner, props.name)
  } catch (error) {
    console.warn('Failed to record view:', error)
  }
}

const handlePlayProject = () => {
  if (record.value?.project) {
    const projectPath = getProjectPageRoute(record.value.project.owner, record.value.project.name)
    router.push(projectPath)
  }
}

const handleLike = () => {
  // TODO: 实现点赞功能
  console.log('Like clicked')
}

const handleShare = () => {
  // 分享功能
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    console.log('URL copied to clipboard')
  })
}

// 记录页面访问
onMounted(async () => {
  if (record.value) {
    try {
      await recordRecordView(props.owner, props.name)
    } catch (error) {
      console.warn('Failed to record view on mount:', error)
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/components/ui/responsive.scss';

.record-page {
  min-height: 100vh;
  background: var(--ui-color-grey-50);
}

.record-wrapper {
  padding: 24px 0 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 主内容框 - 上方的白色框 */
.main-content-frame {
  background: white;
  border-radius: var(--ui-border-radius-2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.content-layout {
  display: flex;
  
  @include responsive(tablet) {
    flex-direction: column;
  }
}

/* 左侧视频区域 */
.video-side {
  flex: 1;
  min-width: 0;
}

.video-container {
  position: relative;
  background: var(--ui-color-grey-900);
  aspect-ratio: 16 / 9;
  
  video {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
  }
}

/* 右侧信息面板 */
.info-side {
  flex: 0 0 400px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  max-height: 100%;
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--ui-color-grey-400);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--ui-color-grey-500);
  }
  
  @include responsive(tablet) {
    flex: none;
    padding: 20px;
    max-height: none;
    overflow-y: visible;
  }
}

.record-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--ui-color-title);
  margin: 0;
  line-height: 1.3;
  flex-shrink: 0;
  
  @include responsive(mobile) {
    font-size: 18px;
  }
}

.record-stats {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--ui-color-text-secondary);
  font-weight: 500;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
  
  .ui-button {
    width: 100%;
    justify-content: center;
    gap: 8px;
  }
}

.owner-section {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--ui-color-grey-200);
  flex-shrink: 0;
}

.owner-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.owner-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.owner-name {
  font-weight: 600;
  color: var(--ui-color-title);
  text-decoration: none;
  
  &:hover {
    color: var(--ui-color-primary-main);
  }
}

.created-time {
  font-size: 12px;
  color: var(--ui-color-text-secondary);
}

.description-section {
  flex-shrink: 0;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--ui-color-title);
    margin: 0 0 12px 0;
  }
}

.description-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--ui-color-text);
  margin: 0 0 12px 0;
}

.project-link {
  a {
    font-size: 14px;
    color: var(--ui-color-primary-main);
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
}



/* 相关内容框 - 下方的白色框 */
.related-content-frame {
  background: white;
  border-radius: var(--ui-border-radius-2);
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  @include responsive(mobile) {
    padding: 20px;
  }
}

.error {
  flex: 1 1 0;
  display: flex;
  border-radius: var(--ui-border-radius-2);
  background: var(--ui-color-grey-100);
  margin: 24px 0;
}

/* 移动端优化 */
@include responsive(mobile) {
  .record-wrapper {
    padding: 16px 0 24px;
  }
  
  .content-layout {
    gap: 0;
  }
  
  .info-side {
    gap: 16px;
  }
  
  .action-buttons {
    .ui-button {
      padding: 12px 16px;
    }
  }
}
</style>