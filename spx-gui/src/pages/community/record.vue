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
          <div ref="videoSideRef" class="video-side">
            <div class="video-container">
              <video ref="videoRef" :src="videoUrl" :poster="thumbnailUrl || ''" controls preload="metadata"
                crossorigin="anonymous" @loadedmetadata="handleVideoLoaded" @play="handleVideoPlay">
                {{ $t({ en: 'Your browser does not support video playback.', zh: '您的浏览器不支持视频播放。' }) }}
              </video>
            </div>
          </div>

          <!-- Right Side - Info Panel -->
          <div ref="infoSideRef" class="info-side">
            <!-- Record Title -->
            <h1 class="record-title">{{ record.title }}</h1>

            <!-- Stats -->
            <div class="record-stats">
              <div class="stat-item">
                <UIIcon type="eye" />
                <span>{{ record.viewCount }}</span>
              </div>
              <div class="stat-item">
                <UIIcon type="heart" />
                <span>{{ record.likeCount }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <UIButton v-if="record.projectFullName" type="primary" size="large"
                :loading="handlePlayProject.isLoading.value" @click="handlePlayProject.fn">
                <UIIcon type="play" />
                {{ $t({ en: 'Play Game', zh: '一键开玩' }) }}
              </UIButton>
              <div class="button-row">
                <UIButton type="secondary" size="medium" :class="{ liking }" :loading="isTogglingLike"
                  @click="handleToggleLike">
                  <UIIcon type="heart" />
                  {{ record.likeCount }}
                </UIButton>
                <UIButton type="secondary" size="medium" @click="handleShare">
                  <UIIcon type="share" />
                  {{ $t({ en: 'Share', zh: '分享' }) }}
                </UIButton>
              </div>
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
            <div v-if="projectQuery.data.value" class="description-section">
              <h3>{{ $t({ en: 'Game Description', zh: '游戏描述' }) }}</h3>
              <p class="description-text">
                {{ projectQuery.data.value.description || $t({ en: 'No description available', zh: '暂无描述' }) }}
              </p>
              <div v-if="projectPageLink" class="project-link">
                <RouterUILink :to="projectPageLink">
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
      <div v-if="record.projectFullName" class="related-content-frame">
        <ProjectsSection context="project" :num-in-row="numInRow" :query-ret="relatedRecordsQuery"
          :link-to="allRecordsLink">
          <template #title>
            {{ $t({ en: 'More recordings of this project', zh: '该项目的其他录屏' }) }}
          </template>
          <template #link>
            {{ $t({ en: 'View all', zh: '查看所有' }) }}
          </template>
          <RecordItem v-for="relatedRecord in relatedRecordsQuery.data.value" :key="relatedRecord.id"
            :record="relatedRecord" />
        </ProjectsSection>
      </div>
    </CenteredWrapper>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePageTitle } from '@/utils/utils'
import { useQuery } from '@/utils/query'
import { humanizeTime, useAsyncComputed } from '@/utils/utils'
import { getProjectPageRoute, getProjectRecordsRoute, getUserPageRoute } from '@/router'
import { createFileWithUniversalUrl } from '@/models/common/cloud'
import { getRecord, recordRecordView, listRecord, likeRecord, unlikeRecord, isLikingRecord } from '@/apis/recording'
import { UILoading, UIError, UIButton, UIIcon, useResponsive } from '@/components/ui'
import UserAvatar from '@/components/community/user/UserAvatar.vue'
import CenteredWrapper from '@/components/community/CenteredWrapper.vue'
import ProjectsSection from '@/components/community/ProjectsSection.vue'
import RecordItem from '@/components/record/RecordItem.vue'
import RouterUILink from '@/components/common/RouterUILink.vue'
import { watchEffect } from 'vue'
import { useMessageHandle } from '@/utils/exception'
import { useEnsureSignedIn } from '@/utils/user'
import { parseProjectFullName, getProject, Visibility } from '@/apis/project'
import { useMessage } from '@/components/ui'
import { useI18n } from '@/utils/i18n'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const videoRef = ref<HTMLVideoElement>()
const videoSideRef = ref<HTMLElement>()
const infoSideRef = ref<HTMLElement>()

// 响应式布局
const isDesktopLarge = useResponsive('desktop-large')
const isMobile = useResponsive('mobile')
const numInRow = computed(() => {
  if (isMobile.value) return 2
  return isDesktopLarge.value ? 5 : 4
})

// 点赞状态
const liking = ref(false)
const isTogglingLike = ref(false)

// 动态调整右侧面板高度匹配左侧视频
const adjustInfoSideHeight = () => {
  if (videoSideRef.value && infoSideRef.value && !isMobile.value) {
    const videoSideHeight = videoSideRef.value.offsetHeight
    infoSideRef.value.style.height = `${videoSideHeight}px`
    infoSideRef.value.style.maxHeight = `${videoSideHeight}px`
  } else if (infoSideRef.value && isMobile.value) {
    // 移动端重置高度限制
    infoSideRef.value.style.height = 'auto'
    infoSideRef.value.style.maxHeight = 'none'
  }
}

// 查询点赞状态
const checkLikingStatus = async () => {
  if (!record.value) return
  try {
    liking.value = await isLikingRecord(props.id)
  } catch (error) {
    console.warn('Failed to check liking status:', error)
    liking.value = false
  }
}

const projectPageLink = computed(() => {
  if (!record.value?.projectFullName) return null
  const { owner, project } = parseProjectFullName(record.value.projectFullName)
  return getProjectPageRoute(owner, project)
})

const projectQuery = useQuery(
  async (ctx) => {
    if (!record.value?.projectFullName) return null
    
    const { owner, project } = parseProjectFullName(record.value.projectFullName)
    return await getProject(owner, project, ctx.signal)
  },
  {
    en: 'Failed to load project',
    zh: '加载项目失败'
  }
)

const ensureSignedIn = useEnsureSignedIn()

const handleLike = useMessageHandle(
  async () => {
    await ensureSignedIn()
    await likeRecord(props.id)
    liking.value = true
    // 更新本地计数
    if (record.value) {
      record.value.likeCount++
    }
  },
  { en: 'Failed to like', zh: '点赞失败' }
)

const handleUnlike = useMessageHandle(
  async () => {
    await ensureSignedIn()
    if (record.value && record.value.likeCount <= 0) return
    
    await unlikeRecord(props.id)
    liking.value = false
    await refetch() // 重新获取数据，而不是手动 --
  },
  { en: 'Failed to unlike', zh: '取消点赞失败' }
)


const handleToggleLike = async () => {
  if (isTogglingLike.value) return

  isTogglingLike.value = true
  try {
    const actionFn = liking.value ? handleUnlike.fn : handleLike.fn
    await actionFn()
  } finally {
    isTogglingLike.value = false
    await checkLikingStatus()
  }
}

// 获取record数据
const {
  data: record,
  isLoading,
  error,
  refetch
} = useQuery(
  async (ctx) => {
    const recordData = await getRecord(props.id, ctx.signal)
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

// 缩略图URL
const thumbnailUrl = useAsyncComputed(async (onCleanup) => {
  if (!record.value?.thumbnailUrl) return null
  const thumbnail = createFileWithUniversalUrl(record.value.thumbnailUrl)
  return thumbnail.url(onCleanup)
})

// 视频URL转换，目前暂定前面的地址为本地的七牛 KODO 测试地址
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
    if (!record.value?.projectFullName) return []

    const { data: records } = await listRecord({
      owner: '*',  // 传入 '*' 表示查询所有用户
      projectFullName: record.value.projectFullName,
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

// 查看所有相关录屏的链接
const allRecordsLink = computed(() => {
  if (!record.value?.projectFullName) return null
  const projectInfo = parseProjectFullName(record.value.projectFullName)
  return getProjectRecordsRoute(projectInfo.owner, projectInfo.project)
})

// 事件处理
const handleVideoLoaded = () => {
  // 视频加载完成后调整高度
  nextTick(() => {
    adjustInfoSideHeight()
  })
}

const handleVideoPlay = async () => {
  // 记录观看次数
  try {
    await recordRecordView(props.id)
  } catch (error) {
    console.warn('Failed to record view:', error)
  }
}

const message = useMessage()
const { t } = useI18n()

const handlePlayProject = useMessageHandle(
  async () => {
    if (!record.value?.projectFullName) return

    const project = projectQuery.data.value

    // 检查项目可见性
    if (project != null && (project.visibility === Visibility.Private)) {
      message.warning(
        t({
          en: 'This project has been set to private and is no longer accessible.',
          zh: '该项目已设置为不可见，无法访问。'
        })
      )
      return
    }

    if (projectPageLink.value) {
      await router.push(projectPageLink.value)
    }
  },
  {
    en: 'Failed to access project',
    zh: '访问项目失败'
  }
)

const handleShare = () => {
  // 分享功能
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    // console.log('URL copied to clipboard')
  })
}

// 在组件挂载后和窗口大小改变时调整高度
onMounted(() => {
  nextTick(() => {
    adjustInfoSideHeight()
  })

  window.addEventListener('resize', adjustInfoSideHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', adjustInfoSideHeight)
})

// 记录页面访问
watchEffect(() => {
  if (record.value?.projectFullName && projectQuery.refetch) {
    projectQuery.refetch()
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
  align-items: flex-start;
  /* 顶部对齐，不拉伸高度 */

  @include responsive(tablet) {
    flex-direction: column;
  }

  @include responsive(mobile) {
    flex-direction: column;
    gap: 0;
  }
}

/* 左侧视频区域 - 固定尺寸 */
.video-side {
  flex: 1;
  min-width: 0;
  padding: 24px;

  @include responsive(mobile) {
    padding: 16px;
  }
}

.video-container {
  position: relative;
  background: var(--ui-color-grey-900);
  aspect-ratio: 16 / 9;
  /* 固定16:9比例 */
  border-radius: var(--ui-border-radius-2);
  overflow: hidden;
  width: 100%;
  /* 固定宽度 */

  video {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
    border-radius: var(--ui-border-radius-2);
  }
}

/* 右侧信息面板 - 高度由JavaScript动态控制 */
.info-side {
  flex: 0 0 400px;
  /* 固定宽度400px */
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  /* 允许滚动 */

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--ui-color-grey-100);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--ui-color-grey-400);
    border-radius: 3px;

    &:hover {
      background: var(--ui-color-grey-500);
    }
  }

  @include responsive(tablet) {
    flex: none;
    padding: 20px;
    max-height: none;
    overflow-y: visible;
  }

  @include responsive(mobile) {
    flex: none;
    padding: 16px;
    max-height: none;
    overflow-y: visible;
    gap: 16px;
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
    line-height: 1.4;
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

  /* 将后两个按钮包装在一行 */
  .button-row {
    display: flex;
    gap: 12px;

    .ui-button {
      flex: 1;
      justify-content: center;
      gap: 8px;
    }
  }

  .ui-button {
    width: 100%;
    justify-content: center;
    gap: 8px;
  }

  .ui-button.liking {
    color: var(--ui-color-primary-main);

    .ui-icon {
      color: var(--ui-color-red-main);
    }
  }

  @include responsive(mobile) {
    .ui-button {
      height: 48px;
      font-size: 16px;
    }
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
  /* 改为 0，不允许收缩 */
  min-height: 0;
  margin-bottom: 20px;
  /* 添加底部间距 */

  &:last-child {
    margin-bottom: 0;
    /* 最后一个元素不需要底部间距 */
  }

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--ui-color-title);
    margin: 0 0 12px 0;
    flex-shrink: 0;

    @include responsive(mobile) {
      font-size: 15px;
      margin: 0 0 10px 0;
    }
  }
}

.description-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--ui-color-text);
  margin: 0 0 12px 0;
  word-wrap: break-word;
  /* 长单词换行 */

  @include responsive(mobile) {
    font-size: 13px;
    line-height: 1.5;
    margin: 0 0 10px 0;
  }
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

  .related-content-frame {
    padding: 16px;
  }
}
</style>