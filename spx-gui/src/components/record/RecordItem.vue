<template>
  <li class="record-item" :class="{ [context]: true }">
    <!-- 右上角操作按钮 -->
    <div v-if="context !== 'public' && isOwner && operatable" class="corner-actions">
      <button
v-radar="{ name: 'Edit record button', desc: 'Click to edit record' }" class="corner-btn edit-btn"
        @click.stop="handleEdit.fn">
        <UIIcon type="edit" />
      </button>
      <button
v-radar="{ name: 'Delete record button', desc: 'Click to delete record' }" class="corner-btn delete-btn"
        @click.stop="handleRemove">
        <UIIcon type="trash" />
      </button>
    </div>
    <RouterLink :to="to" class="link" @click="$emit('selected')">
      <div class="media">
        <div class="thumbnail">
          <UIImg :src="thumbnailUrl" :alt="record.title" />
          <div class="duration-badge">
            {{ formatDuration(record.duration) }}
          </div>
        </div>
        <div v-if="shouldShowAvatar" class="owner-avatar-wrapper">
          <svg
class="avatar-bg" xmlns="http://www.w3.org/2000/svg" width="67" height="31" viewBox="0 0 67 31"
            fill="none">
            <path
              d="M48.67 11.94C43.36 6.71 39.42 0 29.3 0H28.7C18.58 0 14.64 6.71 9.33 11.94C5.47 16.76 -2.39 17.81 -9 18V31H67V18C60.39 17.81 52.53 16.76 48.67 11.94Z"
              fill="white" />
          </svg>
          <UserAvatar
v-radar="{ name: 'Record owner avatar', desc: 'Click to view profile of record owner' }"
            class="owner-avatar" size="small" :user="record.owner" />
        </div>
      </div>
      <div class="info">
        <p class="description" :title="record.description">{{ record.description }}</p>
        <p class="others">
          <span class="part" :class="{ liking }" :title="$t(likesTitle)">
            <UIIcon class="icon" type="heart" />
            {{ $t(humanizeCount(record.likeCount)) }}
          </span>
          <span class="part">
            <UIIcon class="icon" type="eye" />
            {{ $t(humanizeCount(record.viewCount)) }}
          </span>
          <span class="part time" :title="$t(timeTitle)">
            {{ $t(humanizeTime(record.updatedAt)) }}
          </span>
        </p>
      </div>
    </RouterLink>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// import { useRouter } from 'vue-router'
import { useMessageHandle } from '@/utils/exception'
import { humanizeCount, humanizeExactCount, humanizeTime, humanizeExactTime, useAsyncComputed } from '@/utils/utils'
import { getRecordPageRoute } from '@/router'
import { Visibility, type RecordData, deleteRecord, updateRecord } from '@/apis/record'
import { createFileWithUniversalUrl } from '@/models/common/cloud'
import { getSignedInUsername } from '@/stores/user'
import { UIImg, UIDropdown, UIIcon, UIMenu, UIMenuItem } from '@/components/ui'
import UserAvatar from '@/components/community/user/UserAvatar.vue'
import { useEditRecord } from '.'
/**
 * Context (list) where the record item is used
 * - `public`: List of public records from all users
 * - `mine`: List of "my records"
 * - `edit`: List of "my records" to edit
 */
type Context = 'public' | 'mine' | 'edit'

const props = withDefaults(
  defineProps<{
    record: RecordData
    /** Context (list) where the record item is used */
    context?: Context
  }>(),
  {
    context: 'public'
  }
)

const emit = defineEmits<{
  selected: []
  removed: []
  updated: [updatedRecord: RecordData]  // 新增
}>()

const isOwner = computed(() => props.record.owner === getSignedInUsername())
const operatable = computed(() => props.context === 'mine' && isOwner.value)
// 计算是否应该显示头像
const shouldShowAvatar = computed(() => {
  // 如果是public context，总是显示头像
  if (props.context === 'public') return true

  // 如果是mine context，但record不是当前用户的，也显示头像（用于查看喜欢的records）
  if (props.context === 'mine' && props.record.owner !== getSignedInUsername()) return true

  // 如果是edit context，且不是当前用户的，也显示头像
  if (props.context === 'edit' && props.record.owner !== getSignedInUsername()) return true

  // 其他情况不显示头像（自己的records）
  return false
})

// const router = useRouter()

const to = computed(() => {
  const { owner, name } = props.record
  // 使用实际的录屏详情页面路由
  return getRecordPageRoute(owner, name)
})

const thumbnailUrl = useAsyncComputed(async (onCleanup) => {
  const thumbnailUniversalUrl = props.record.thumbnailUrl
  if (thumbnailUniversalUrl === '') return null
  const thumbnail = createFileWithUniversalUrl(thumbnailUniversalUrl)
  return thumbnail.url(onCleanup)
})

// 格式化视频时长
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// TODO: 需要实现录屏点赞状态查询
const liking = computed(() => false) // 临时固定为false

const likesTitle = computed(() => {
  const count = humanizeExactCount(props.record.likeCount)
  return {
    en: `Liked by ${count.en} users`,
    zh: `${count.zh} 个用户喜欢`
  }
})

const timeTitle = computed(() => {
  const fullTime = humanizeExactTime(props.record.updatedAt)
  return {
    en: `Last updated at ${fullTime.en}`,
    zh: `最后更新于 ${fullTime.zh}`
  }
})

// 在script setup中添加
const editRecord = useEditRecord()

// 修改handleEdit函数
const handleEdit = useMessageHandle(
  async () => {
    const updatedRecord = await editRecord(props.record)  // 这会打开模态框
    emit('updated', updatedRecord)  // 通知父组件
    return updatedRecord
  },
  { en: 'Failed to edit record', zh: '编辑录屏失败' }
)

const handleRemove = useMessageHandle(
  async () => {
    const { owner, name } = props.record
    await deleteRecord(owner, name)
    emit('removed')
  },
  { en: 'Failed to remove record', zh: '删除录屏失败' },
  { en: 'Record removed successfully', zh: '录屏删除成功' }
).fn

</script>

<style lang="scss" scoped>
@import '@/utils/utils';
@import '@/components/ui/responsive.scss';

.record-item {
  width: 232px;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: var(--ui-border-radius-2);
  border: 1px solid var(--ui-color-grey-400);
  background-color: var(--ui-color-grey-100);
  transition: 0.1s;

  @include responsive(mobile) {
    width: 100%;
    aspect-ratio: 230/280;
    font-size: 14px;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.link {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: inherit;
  text-decoration: none;

  &:hover {
    color: inherit;
    text-decoration: none;
  }
}

.media {
  position: relative;
  width: 100%;
  aspect-ratio: 230/171;
  overflow: visible;
  background-color: var(--ui-color-grey-300);

  .thumbnail {
    position: relative;
    width: 100%;
    height: 100%;

    :deep(.ui-img) {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .duration-badge {
    position: absolute;
    bottom: 6px;
    right: 6px;
    padding: 2px 6px;
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 12px;
    font-weight: 500;

    @include responsive(mobile) {
      font-size: 0.86em;
      padding: 0.14em 0.43em;
    }
  }


  .owner-avatar-wrapper {
    position: absolute;
    bottom: -9px;
    left: 0;
    width: 100%;
    height: 13px;
    background-color: var(--ui-color-grey-100);

    .avatar-bg {
      position: absolute;
      bottom: 0;
      left: 0;
    }

    .owner-avatar {
      position: absolute;
      bottom: -2px;
      left: 14px;
    }
  }
}

.info {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px 12px 12px 12px;
  gap: 8px;

  @include responsive(mobile) {
    padding: 0.86em;
  }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;

    .more-btn {
      flex: 0 0 auto;
      padding: 2px;
      border-radius: 4px;
      cursor: pointer;
      color: var(--ui-color-grey-600);

      &:hover {
        background-color: var(--ui-color-grey-200);
        color: var(--ui-color-grey-800);
      }
    }

    .icon {
      flex: 0 0 auto;
      margin-left: 4px;
      width: 16px;
      height: 16px;
    }
  }

  .description {
    font-size: 14px;
    color: var(--ui-color-grey-600);
    // line-height: 1.4;

    // 单行省略号样式
    white-space: nowrap; // 强制单行显示
    overflow: hidden; // 隐藏超出部分
    text-overflow: ellipsis; // 显示省略号

    @include responsive(mobile) {
      font-size: 0.86em;
      line-height: 1.4em;
    }
  }

  .others {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: auto;
    font-size: 13px;  // ← 改为与 ProjectItem 相同
  line-height: 20px;  // ← 添加行高设置
    color: var(--ui-color-grey-700);

    @include responsive(mobile) {
      gap: 0.57em;
      font-size: 0.86em;
    }

    .part {
      display: flex;
      align-items: center;
      gap: 3px;

      @include responsive(mobile) {
        gap: 0.21em;
      }

      .icon {
        width: 14px;
        height: 14px;

        @include responsive(mobile) {
          width: 0.86em;
          height: 0.86em;
        }
      }

      &.liking {
        color: var(--ui-color-primary-600);
      }

      &.time {
        margin-left: auto;
      }
    }
  }
}

.record-item {
  position: relative; // 确保定位上下文

  // 默认隐藏操作按钮
  .corner-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 4px;
    opacity: 0;
    transform: translateY(-4px);
    transition: all 0.2s;
    z-index: 10;
  }

  // 悬停时显示
  &:hover {
    .corner-actions {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>