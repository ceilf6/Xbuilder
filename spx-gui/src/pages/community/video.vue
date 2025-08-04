<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMessageHandle } from '@/utils/exception'
import { useQuery } from '@/utils/query'
import { humanizeCount, humanizeExactCount, untilNotNull } from '@/utils/utils'
import { useEnsureSignedIn } from '@/utils/user'
import { usePageTitle } from '@/utils/utils'
import { ownerAll, Visibility } from '@/apis/video'
import { type VideoData } from '@/apis/video'
import { useUser, isSignedIn, getSignedInUsername } from '@/stores/user'
import { getUserPageRoute } from '@/router'
import {
  UIIcon,
  UILoading,
  UIError,
  UIButton,
  UITooltip,
  UIDropdown,
  UIMenu,
  UIMenuItem,
  UIDivider,
  UICollapse,
  UICollapseItem
} from '@/components/ui'
import CenteredWrapper from '@/components/community/CenteredWrapper.vue'
import CommunityCard from '@/components/community/CommunityCard.vue'
import OwnerInfo from '@/components/community/project/OwnerInfo.vue'
import TextView from '@/components/community/TextView.vue'
import VideoItem from '@/components/video/VideoItem.vue'
import { getMockRecords } from '@/mock/videoData'

const props = defineProps<{
  owner: string
  name: string
}>()

const router = useRouter()

const videoPlayerState = ref<'initial' | 'loading' | 'playing'>('initial')
watch(
  () => [props.owner, props.name],
  () => {
    videoPlayerState.value = 'initial'
  }
)

const isOwner = computed(() => props.owner === getSignedInUsername())

const videoPlayerRef = ref<HTMLVideoElement | null>(null)
const isFullScreenPlaying = ref(false)

// Mock video data - in real implementation this would be from API
const mockVideo: VideoData = {
  id: '1',
  createdAt: '2025-07-30T10:00:00Z',
  updatedAt: '2025-07-30T10:00:00Z',
  owner: props.owner,
  name: props.name,
  title: '我的第一个游戏项目演示',
  description: '这是我在Go+ Builder中创建的第一个游戏项目，一个简单但有趣的冒险游戏。',
  videoUrl: 'https://example.com/records/demo.mp4',
  thumbnail: 'https://picsum.photos/744/558?random=1',
  duration: 180, // 3 minutes
  visibility: Visibility.Public,
  viewCount: 1250,
  likeCount: 89
}

// Additional video information
const gameDescription = '这是一个令人兴奋的冒险游戏，玩家需要控制主角在神秘的世界中探索，收集道具，战胜敌人。游戏采用了经典的2D横版卷轴设计，结合了解谜和动作元素。'
const recordingDescription = '视频录制于游戏完成后的第一次完整通关，展示了游戏的主要玩法和特色功能。录制过程中使用了最新版本的Go+ Builder编辑器，画面流畅清晰。'

const {
  data: video,
  isLoading,
  error,
  refetch: reloadVideo
} = useQuery(
  async (ctx) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockVideo
  },
  {
    en: 'Failed to load video',
    zh: '加载视频失败'
  }
)

const { data: ownerInfo } = useUser(() => props.owner)

usePageTitle(() => {
  if (ownerInfo.value == null) return null
  return [
    {
      en: props.name,
      zh: props.name
    },
    {
      en: ownerInfo.value.displayName,
      zh: ownerInfo.value.displayName
    }
  ]
})

watch(
  () => [props.owner, props.name],
  () => {
    // In real implementation, record video view
    console.log('Recording video view for:', props.owner, props.name)
  },
  { immediate: true }
)

const likeCount = computed(() => {
  if (video.value == null) return null
  const count = humanizeExactCount(video.value.likeCount)
  return {
    title: {
      en: `Liked by ${count.en} users`,
      zh: `${count.zh} 个用户喜欢`
    },
    text: humanizeCount(video.value.likeCount)
  }
})

const viewCount = computed(() => {
  if (video.value == null) return null
  const count = humanizeCount(video.value.viewCount)
  return {
    title: {
      en: `Viewed ${count.en} times`,
      zh: `被观看 ${count.zh} 次`
    },
    text: count
  }
})

const ensureSignedIn = useEnsureSignedIn()

const handlePlay = useMessageHandle(
  async () => {
    videoPlayerState.value = 'loading'
    // Simulate video loading
    await new Promise(resolve => setTimeout(resolve, 1000))
    videoPlayerState.value = 'playing'
  },
  { en: 'Failed to play video', zh: '播放视频失败' }
)

const handleStop = useMessageHandle(
  async () => {
    videoPlayerRef.value?.pause()
    videoPlayerState.value = 'initial'
  },
  { en: 'Failed to stop video', zh: '停止视频失败' }
)

const handleOneClickPlay = useMessageHandle(
  async () => {
    // Simulate opening game for playing
    window.open('https://example.com/play-game', '_blank')
  },
  { en: 'Failed to open game', zh: '打开游戏失败' }
)

const liking = ref(false) // Mock liking state

const handleLike = useMessageHandle(
  async () => {
    await ensureSignedIn()
    liking.value = true
    // Simulate like action
    if (video.value) {
      video.value.likeCount++
    }
  },
  { en: 'Failed to like', zh: '标记喜欢失败' }
)

const handleUnlike = useMessageHandle(
  async () => {
    liking.value = false
    // Simulate unlike action
    if (video.value) {
      video.value.likeCount--
    }
  },
  { en: 'Failed to unlike', zh: '取消喜欢失败' }
)

const isTogglingLike = computed(() => false) // Simplified for demo

function handleToggleLike() {
  return (liking.value ? handleUnlike.fn : handleLike.fn)()
}

const handleShare = useMessageHandle(() => {
  // Simulate share functionality
  const url = `${window.location.origin}/records/${props.owner}/${props.name}`
  navigator.clipboard.writeText(url)
}, {
  en: 'Failed to share video',
  zh: '分享视频失败'
}, {
  en: 'Video link copied to clipboard',
  zh: '视频链接已复制到剪贴板'
})

const handleEdit = useMessageHandle(
  async () => {
    // Simulate edit functionality
    console.log('Edit video:', props.owner, props.name)
  },
  { en: 'Failed to open editor', zh: '打开编辑器失败' }
)

const handleRemove = useMessageHandle(
  async () => {
    // Simulate remove functionality
    await router.push(getUserPageRoute(getSignedInUsername()!, 'records'))
  },
  { en: 'Failed to remove video', zh: '删除视频失败' },
  { en: 'Video removed', zh: '视频已删除' }
)

// Related hot records
const hotRecords = computed(() => getMockRecords().slice(0, 6))

const handleRecordSelected = (recordId: string) => {
  // TODO: Implement record player route
  console.log('Navigate to record:', recordId)
}
</script>

<template>
  <CenteredWrapper size="large">
    <CommunityCard
      v-radar="{ name: 'Video content', desc: 'Main content area for video details and player' }"
      class="main"
    >
      <UILoading v-if="isLoading" cover mask="solid" />
      <UIError v-else-if="error != null" class="error" :retry="reloadVideo">
        {{ $t(error.userMessage) }}
      </UIError>
      <div class="left">
        <div class="video-wrapper">
          <template v-if="video != null">
            <video 
              ref="videoPlayerRef" 
              :key="`${video.owner}/${video.name}`" 
              class="video-player"
              :poster="video.thumbnail"
              controls
            >
              <source :src="video.videoUrl" type="video/mp4">
              Your browser does not support the video tag.
            </video>
            <div v-show="videoPlayerState === 'initial'" class="player-mask">
              <UIButton
                v-radar="{ name: 'Play button', desc: 'Click to play the video' }"
                class="play-button"
                type="primary"
                size="large"
                icon="playHollow"
                :disabled="videoPlayerRef == null"
                :loading="handlePlay.isLoading.value"
                @click="handlePlay.fn"
                >{{ $t({ en: 'Play', zh: '播放' }) }}</UIButton
              >
            </div>
          </template>
        </div>
        <div class="ops">
          <UIButton
            v-if="videoPlayerState === 'playing'"
            v-radar="{ name: 'Stop button', desc: 'Click to stop the playing video' }"
            type="boring"
            icon="end"
            @click="handleStop.fn"
          >
            {{ $t({ en: 'Stop', zh: '停止' }) }}
          </UIButton>
        </div>
      </div>
      <div class="right">
        <template v-if="video != null">
          <h2 class="title">{{ video.title }}</h2>
          <div class="info">
            <OwnerInfo :owner="video.owner!" />
            <p class="extra">
              <span class="part" :title="$t(viewCount!.title)">
                <UIIcon class="icon" type="eye" />
                {{ $t(viewCount!.text) }}
              </span>
              <template v-if="isOwner">
                <i class="sep"></i>
                <span class="part" :title="$t(likeCount!.title)">
                  <UIIcon class="icon" type="heart" />
                  {{ $t(likeCount!.text) }}
                </span>
              </template>
            </p>
          </div>
          <div class="ops">
            <template v-if="isOwner">
              <UIButton
                v-radar="{ name: 'One click play button', desc: 'Click to play the game directly' }"
                type="primary"
                size="large"
                icon="play"
                :loading="handleOneClickPlay.isLoading.value"
                @click="handleOneClickPlay.fn"
                >{{ $t({ en: 'One-click Play', zh: '一键开玩' }) }}</UIButton
              >
              <UIButton
                v-radar="{ name: 'Share button', desc: 'Click to share the video' }"
                type="boring"
                size="large"
                icon="share"
                @click="handleShare.fn"
                >{{ $t({ en: 'Share', zh: '分享' }) }}</UIButton
              >
              <UIDropdown placement="bottom-end" trigger="click">
                <template #trigger>
                  <UIButton
                    v-radar="{ name: 'More options button', desc: 'Click to see more video options' }"
                    class="more"
                    type="boring"
                    size="large"
                    icon="more"
                  ></UIButton>
                </template>
                <UIMenu>
                  <UIMenuItem
                    v-radar="{ name: 'Edit option', desc: 'Click to edit the video' }"
                    @click="handleEdit.fn"
                    >{{ $t({ en: 'Edit', zh: '编辑' }) }}</UIMenuItem
                  >
                  <UIMenuItem
                    v-radar="{ name: 'Remove option', desc: 'Click to remove the video' }"
                    @click="handleRemove.fn"
                    >{{ $t({ en: 'Remove', zh: '删除' }) }}</UIMenuItem
                  >
                </UIMenu>
              </UIDropdown>
            </template>
            <template v-else>
              <UIButton
                v-radar="{ name: 'One click play button', desc: 'Click to play the game directly' }"
                type="primary"
                size="large"
                icon="play"
                :loading="handleOneClickPlay.isLoading.value"
                @click="handleOneClickPlay.fn"
                >{{ $t({ en: 'One-click Play', zh: '一键开玩' }) }}</UIButton
              >
              <UIButton
                v-radar="{ name: 'Like button', desc: 'Click to like or unlike the video' }"
                :class="{ liking }"
                type="boring"
                size="large"
                :title="$t(likeCount!.title)"
                :icon="liking ? 'heart' : 'heartHollow'"
                :loading="isTogglingLike"
                @click="handleToggleLike"
              >
                {{ $t(likeCount!.text) }}
              </UIButton>
              <UIButton
                v-radar="{ name: 'Share button', desc: 'Click to share the video' }"
                type="boring"
                size="large"
                icon="share"
                @click="handleShare.fn"
                >{{ $t({ en: 'Share', zh: '分享' }) }}</UIButton
              >
            </template>
          </div>
          <UIDivider class="divider" />
          <UICollapse
            v-radar="{
              name: 'Video details',
              desc: 'Collapsible sections showing video description, game description and recording description'
            }"
            class="collapse"
            :default-expanded-names="['description', 'gameDescription', 'recordingDescription']"
          >
            <UICollapseItem :title="$t({ en: 'Game Description', zh: '游戏描述' })" name="gameDescription">
              <TextView :text="gameDescription" :placeholder="$t({ en: 'No game description yet', zh: '暂无游戏描述' })" />
            </UICollapseItem>
            <UICollapseItem :title="$t({ en: 'Recording Description', zh: '录屏描述' })" name="recordingDescription">
              <TextView
                :text="recordingDescription"
                :placeholder="$t({ en: 'No recording description yet', zh: '暂无录屏描述' })"
              />
            </UICollapseItem>
          </UICollapse>
        </template>
      </div>
    </CommunityCard>
    <CommunityCard
      v-radar="{ name: 'Related hot records section', desc: 'Section showing related popular records' }"
      class="hot-records"
    >
      <h3 class="section-title">
        {{
          $t({
            en: 'Related Hot Records',
            zh: '相关热门记录'
          })
        }}
      </h3>
      <div class="records-grid">
        <VideoItem 
          v-for="hotRecord in hotRecords" 
          :key="hotRecord.id" 
          :video="hotRecord" 
          @selected="handleRecordSelected(hotRecord.id)"
        />
      </div>
    </CommunityCard>
  </CenteredWrapper>
</template>

<style scoped lang="scss">
.error {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: var(--ui-color-grey-100);
}

.main {
  position: relative;
  flex: 0 0 auto;
  margin-top: 24px;
  padding: 20px;
  display: flex;
  gap: 40px;
  background: var(--ui-color-grey-100);
}

.left {
  flex: 1 1 744px;
  .video-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: var(--ui-border-radius-1);
    overflow: hidden;

    .video-player {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .player-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: var(--ui-border-radius-1);
      background: rgba(87, 96, 106, 0.2);
      backdrop-filter: blur(5px);
    }

    .play-button {
      width: 160px;
    }
  }

  .ops {
    margin-top: 12px;
    display: flex;
    gap: var(--ui-gap-middle);
    justify-content: flex-end;
  }
}

.right {
  flex: 1 1 456px;
  min-width: 0;
  padding-right: 20px;
  display: flex;
  flex-direction: column;

  .title {
    font-size: 20px;
    line-height: 1.4;
    color: var(--ui-color-title);
    word-break: break-all;
  }

  .info {
    margin-top: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .extra {
      display: flex;
      align-items: center;
      gap: 8px;

      .part {
        display: flex;
        gap: 4px;
        align-items: center;
        color: var(--ui-color-hint-2);
      }

      .icon {
        width: 14px;
        height: 14px;
      }

      .sep {
        width: 1px;
        height: 12px;
        background-color: var(--ui-color-dividing-line-1);
      }
    }
  }

  .ops {
    margin-top: 16px;
    display: flex;
    gap: 12px;

    & > * {
      flex: 1 1 0;

      &.more {
        flex: 0 0 auto;
        width: 40px;
        :deep(.content) {
          padding: 0;
        }
      }
    }

    .liking :deep(.content) {
      color: var(--ui-color-red-main);
    }
  }

  .divider {
    margin: 24px 0 16px;
  }

  .collapse {
    margin-bottom: 8px;
    flex: 1 1 0;
    overflow-y: auto;
  }
}

.hot-records {
  margin-top: 20px;
  padding: 20px;
  background: var(--ui-color-grey-100);

  .section-title {
    font-size: 18px;
    color: var(--ui-color-title);
    margin-bottom: 16px;
  }

  .records-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(232px, 1fr));
    gap: 20px;
  }
}
</style>
