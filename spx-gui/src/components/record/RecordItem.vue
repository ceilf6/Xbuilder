<template>
    <li class="record-item" :class="{ [context]: true }">
      <RouterLink :to="to" class="link" @click="$emit('selected')">
        <div class="media">
          <div class="thumbnail">
            <UIImg :src="thumbnailUrl" :alt="record.title" />
            <div class="duration-badge">
              {{ formatDuration(record.duration) }}
            </div>
          </div>
          <div v-if="context !== 'public'" class="owner-info">
            <UserAvatar
              class="owner-avatar"
              size="small"
              :user="{ username: record.owner }"
            />
          </div>
        </div>
        <div class="info">
          <div class="header">
            <h5 class="name" :title="record.title">{{ record.title }}</h5>
            <template v-if="context !== 'public' && isOwner">
              <UIDropdown v-if="operatable" placement="bottom-end" :offset="{ x: -8, y: 4 }">
                <template #trigger>
                  <UIIcon
                    v-radar="{ name: 'Record options', desc: 'Open record options menu' }"
                    class="more-btn"
                    type="more"
                  />
                </template>
                <UIMenu>
                  <UIMenuItem @click="handleEdit">
                    {{ $t({ en: 'Edit', zh: '编辑' }) }}
                  </UIMenuItem>
                  <UIMenuItem @click="handleRemove">
                    {{ $t({ en: 'Remove', zh: '删除' }) }}
                  </UIMenuItem>
                </UIMenu>
              </UIDropdown>
              <i v-if="record.visibility === Visibility.Public" class="icon" :title="$t({ en: 'Public', zh: '公开' })">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M15.221 9.88533L14.829 10.2774C14.5792 10.5272 14.4387 10.8668 14.4387 11.2206V11.7726C14.4387 13.2447 13.2457 14.4377 11.7736 14.4377H11.2216C10.8678 14.4377 10.5291 14.5782 10.2784 14.828L9.88544 15.22C8.84446 16.261 7.15722 16.261 6.11624 15.22L5.72331 14.828C5.47351 14.5782 5.13389 14.4377 4.78009 14.4377H4.22807C2.75594 14.4377 1.56302 13.2447 1.56302 11.7726V11.2206C1.56302 10.8668 1.42249 10.5281 1.17269 10.2774L0.780732 9.88533C-0.260244 8.84435 -0.260244 7.15711 0.780732 6.11614L1.17269 5.72409C1.42249 5.4743 1.56302 5.13471 1.56302 4.7809V4.22885C1.56302 2.75673 2.75594 1.56376 4.22807 1.56376H4.78009C5.13389 1.56376 5.47262 1.4233 5.72331 1.1735L6.11624 0.781464C7.15722 -0.259511 8.84446 -0.259511 9.88544 0.781464L10.2784 1.1735C10.5282 1.4233 10.8678 1.56376 11.2216 1.56376H11.7736C13.2457 1.56376 14.4387 2.75673 14.4387 4.22885V4.7809C14.4387 5.13471 14.5792 5.47341 14.829 5.72409L15.221 6.11614C16.2619 7.15711 16.2619 8.84435 15.221 9.88533Z"
                    fill="#219FFC"
                  />
                  <g clip-path="url(#clip0_480_7774)">
                    <path
                      d="M8.00035 3.95435C5.76935 3.95435 3.95459 5.76948 3.95459 8.00011C3.95459 10.2307 5.76935 12.0459 8.00035 12.0459C10.2314 12.0459 12.0461 10.2307 12.0461 8.00011C12.0461 5.76948 10.2314 3.95435 8.00035 3.95435ZM4.51911 8.00011C4.51911 7.59892 4.59062 7.21504 4.71632 6.856C4.94965 8.55334 6.4385 8.69673 6.50285 8.96733C6.57436 9.27217 6.50286 9.3625 6.5292 9.88562C6.55555 10.4088 7.27813 10.4163 7.55663 10.8303C7.63867 10.9507 7.68611 11.2085 7.66579 11.4644C5.90259 11.2954 4.51911 9.80659 4.51911 8.00011ZM8.94499 11.3477C9.20129 10.545 9.97091 10.2729 10.0492 9.80885C10.112 9.43664 9.62279 9.2462 9.18359 9.19201C8.74853 9.14195 8.81139 8.6862 8.50203 8.36404C8.19267 8.04189 7.99019 8.06032 7.5555 8.11451C7.1163 8.16457 6.74823 8.13334 6.62667 7.86575C6.50962 7.59817 6.66017 7.47021 6.34027 7.13864C6.07381 6.8624 6.35984 6.61477 6.5021 6.58127C6.72791 6.52708 7.12947 6.92186 7.36469 6.87369C8.07335 6.72766 7.22431 5.34081 8.28863 4.99194C8.47493 4.93097 8.64917 4.7827 8.73686 4.59904C9.34504 4.73076 9.89226 5.0228 10.3371 5.427C10.4594 5.77512 10.5445 6.17482 10.4733 6.3867C10.3311 6.8259 9.97394 7.14165 10.3638 7.86048C10.7707 8.61092 11.0217 8.71292 11.2046 8.50668C11.2772 8.42463 11.3717 8.36668 11.4658 8.33168C11.3277 9.77573 10.304 10.9635 8.94499 11.3477Z"
                      fill="white"
                      stroke="white"
                      stroke-width="0.166741"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_480_7774">
                      <rect width="9.60011" height="9.60011" fill="white" transform="matrix(1 0 0 -1 3.2002 12.8003)" />
                    </clipPath>
                  </defs>
                </svg>
              </i>
              <i v-else class="icon" :title="$t({ en: 'Private', zh: '私有' })">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M15.221 9.88533L14.829 10.2774C14.5792 10.5272 14.4387 10.8668 14.4387 11.2206V11.7726C14.4387 13.2447 13.2457 14.4377 11.7736 14.4377H11.2216C10.8678 14.4377 10.5291 14.5782 10.2784 14.828L9.88544 15.22C8.84446 16.261 7.15722 16.261 6.11624 15.22L5.72331 14.828C5.47351 14.5782 5.13389 14.4377 4.78009 14.4377H4.22807C2.75594 14.4377 1.56302 13.2447 1.56302 11.7726V11.2206C1.56302 10.8668 1.42249 10.5281 1.17269 10.2774L0.780732 9.88533C-0.260244 8.84435 -0.260244 7.15711 0.780732 6.11614L1.17269 5.72409C1.42249 5.4743 1.56302 5.13471 1.56302 4.7809V4.22885C1.56302 2.75673 2.75594 1.56376 4.22807 1.56376H4.78009C5.13389 1.56376 5.47262 1.4233 5.72331 1.1735L6.11624 0.781464C7.15722 -0.259511 8.84446 -0.259511 9.88544 0.781464L10.2784 1.1735C10.5282 1.4233 10.8678 1.56376 11.2216 1.56376H11.7736C13.2457 1.56376 14.4387 2.75673 14.4387 4.22885V4.7809C14.4387 5.13471 14.5792 5.47341 14.829 5.72409L15.221 6.11614C16.2619 7.15711 16.2619 8.84435 15.221 9.88533Z"
                    fill="#FAA135"
                  />
                  <path
                    d="M5.60376 5.64023C5.60376 4.75786 6.32134 4.04028 7.20371 4.04028C8.08608 4.04028 8.80366 4.75786 8.80366 5.64023C8.80366 6.5226 8.08608 7.24018 7.20371 7.24018C6.32134 7.24018 5.60376 6.5226 5.60376 5.64023ZM9.40203 8.50654C9.40003 8.48734 9.38484 8.45176 9.35564 8.43096C9.02325 8.18897 8.57765 8.04015 8.00007 8.04015H6.40012C4.77618 8.04015 4.2002 9.22812 4.2002 10.2481C4.2002 11.1601 4.68418 11.64 5.60015 11.64H8.68403C8.74403 11.64 8.80005 11.592 8.80405 11.528C8.80405 11.524 8.80405 11.524 8.80405 11.52V11.516C8.80005 11.484 8.80005 11.4481 8.80005 11.4121V10.4681C8.80005 10.0601 8.94404 9.72807 9.20003 9.51608V9.34011C9.20003 9.06452 9.26884 8.80813 9.38924 8.58374C9.40523 8.55374 9.40403 8.52574 9.40203 8.50654ZM12.1999 10.4685V11.4112C12.1999 11.83 11.9999 12.0396 11.6 12.0396H10C9.60002 12.0396 9.40003 11.83 9.40003 11.4112V10.4685C9.40003 10.1293 9.53802 9.93448 9.80001 9.86968V9.33972C9.80001 8.78854 10.2484 8.33975 10.8 8.33975C11.3516 8.33975 11.7999 8.78854 11.7999 9.33972V9.86968C12.0619 9.93448 12.1999 10.1293 12.1999 10.4685ZM11.2 9.34011C11.2 9.11972 11.0208 8.94012 10.8 8.94012C10.5792 8.94012 10.4 9.11972 10.4 9.34011V9.84009H11.2V9.34011Z"
                    fill="white"
                  />
                </svg>
              </i>
            </template>
          </div>
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
  import { useRouter } from 'vue-router'
  import { useMessageHandle } from '@/utils/exception'
  import { humanizeCount, humanizeExactCount, humanizeTime, humanizeExactTime, useAsyncComputed } from '@/utils/utils'
  import { getProjectPageRoute } from '@/router' // 临时使用项目路由
  import { Visibility, type RecordData } from '@/apis/record'
  import { createFileWithUniversalUrl } from '@/models/common/cloud'
  import { getSignedInUsername } from '@/stores/user'
  import { UIImg, UIDropdown, UIIcon, UIMenu, UIMenuItem } from '@/components/ui'
  import UserAvatar from '@/components/community/user/UserAvatar.vue'
  // import { useRemoveRecord } from '.' // TODO: 需要创建删除录屏的 hook
  
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
  }>()
  
  const isOwner = computed(() => props.record.owner === getSignedInUsername())
  const operatable = computed(() => props.context === 'mine' && isOwner.value)
  
  const router = useRouter()
  
  const to = computed(() => {
    const { owner, name } = props.record
    // TODO: 实现录屏详情页面路由，临时跳转到项目页面
    return getProjectPageRoute(owner, name)
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
  
  function handleEdit() {
    // TODO: 实现录屏编辑逻辑
    console.log('Edit record:', props.record.name)
  }
  
  const handleRemove = useMessageHandle(
    async () => {
      // TODO: 实现录屏删除逻辑
      const { owner, name } = props.record
      // await removeRecord(owner, name)
      console.log('Remove record:', owner, name)
      emit('removed')
    },
    { en: 'Failed to remove record', zh: '删除录屏失败' }
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
    
    // 移动端适配
    @include responsive(mobile) {
      width: 100%; 
      aspect-ratio: 230/280; // 录屏卡片稍高一些，因为有更多信息
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
    aspect-ratio: 16/9;
    overflow: hidden;
    background-color: var(--ui-color-grey-300);
    
    .thumbnail {
      position: relative;
      width: 100%;
      height: 100%;
      
      :deep(.ui-img) {
        width: 100%;
        height: 100%;
        object-fit: cover;
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
    }
    
    .owner-info {
      position: absolute;
      bottom: 6px;
      left: 6px;
      
      .owner-avatar {
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }
    }
  }
  
  .info {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 12px;
    gap: 6px;
  
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
  
      .name {
        flex: 1;
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        line-height: 1.3;
        color: var(--ui-color-title);
        @include text-ellipsis;
      }
  
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
      font-size: 12px;
      color: var(--ui-color-grey-600);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  
    .others {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: auto;
      font-size: 12px;
      color: var(--ui-color-grey-600);
  
      .part {
        display: flex;
        align-items: center;
        gap: 3px;
  
        .icon {
          width: 12px;
          height: 12px;
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
  </style>