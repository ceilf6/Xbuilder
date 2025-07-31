<template>
  <li class="video-item">
    <div class="link" @click="emit('selected')">
      <div class="thumbnail-wrapper">
        <UIImg class="thumbnail" :src="thumbnailUrl" size="cover" />
        <div class="play-overlay">
          <UIIcon class="play-icon" type="playHollow" />
        </div>
        <div class="duration" v-if="video.duration > 0">
          {{ formatDuration(video.duration) }}
        </div>
      </div>
      <div class="info">
        <div class="header">
          <h5 class="title" :title="video.title">{{ video.title }}</h5>
        </div>
        <p class="others">
          <span class="part">
            <UIIcon class="icon" type="heart" />
            {{ $t(humanizeCount(video.likeCount)) }}
          </span>
          <span class="part views">
            <UIIcon class="icon" type="eye" />
            {{ $t(humanizeCount(video.viewCount)) }}
          </span>
          <span class="part time">
            {{ $t(humanizeTime(video.updatedAt)) }}
          </span>
        </p>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { humanizeCount, humanizeTime, useAsyncComputed } from '@/utils/utils'
import { type VideoData } from '@/apis/video'
import { createFileWithUniversalUrl } from '@/models/common/cloud'
import { UIImg, UIIcon } from '@/components/ui'

const props = defineProps<{
  video: VideoData
}>()

const emit = defineEmits<{
  selected: []
}>()

const thumbnailUrl = useAsyncComputed(async (onCleanup) => {
  const thumbnailUniversalUrl = props.video.thumbnail
  if (thumbnailUniversalUrl === '') return null
  
  // If it's already a regular URL (like from Picsum), return it directly
  if (thumbnailUniversalUrl.startsWith('http')) {
    return thumbnailUniversalUrl
  }
  
  // Otherwise use the file system
  const thumbnail = createFileWithUniversalUrl(thumbnailUniversalUrl)
  return thumbnail.url(onCleanup)
})

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
@import '@/utils/utils';

.video-item {
  width: 232px;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: var(--ui-border-radius-2);
  border: 1px solid var(--ui-color-grey-400);
  background-color: var(--ui-color-grey-100);
  transition: 0.1s;
  cursor: pointer;
}

.link {
  display: flex;
  flex-direction: column;
  text-decoration: none;
}

.thumbnail-wrapper {
  position: relative;
  width: 100%;
  height: 130px;
  background-color: var(--ui-color-grey-300);

  .thumbnail {
    width: 100%;
    height: 100%;
  }

  .play-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 48px;
    height: 48px;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
    transition: opacity 0.2s;

    .play-icon {
      width: 24px;
      height: 24px;
      color: white;
      margin-left: 2px; // Center the play icon visually
    }
  }

  .duration {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    line-height: 16px;
  }

  .options {
    opacity: 0;
    visibility: hidden;
    position: absolute;
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    color: var(--ui-color-grey-800);
    background-color: var(--ui-color-grey-100);
    cursor: pointer;
    transition: 0.1s;

    &:hover {
      color: var(--ui-color-grey-100);
      background-color: var(--ui-color-primary-main);
    }

    .icon {
      width: 21px;
      height: 21px;
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

.video-item:hover {
  box-shadow: 0px 4px 12px 0px rgba(36, 41, 47, 0.08);
  
  .thumbnail-wrapper {
    .options {
      visibility: visible;
      opacity: 1;
    }
    
    .play-overlay {
      opacity: 1;
    }
  }
}

.info {
  padding: var(--ui-gap-middle);

  .header {
    display: flex;
    align-items: center;
    gap: 4px;

    .title {
      flex: 0 1 auto;
      font-size: 15px;
      line-height: 24px;
      color: var(--ui-color-title);
      @include text-ellipsis;
    }

    .icon {
      width: 16px;
      height: 16px;
    }
  }

  .others {
    margin-top: 4px;
    display: flex;
    height: 20px;
    gap: 12px;
    font-size: 13px;
    line-height: 20px;
    color: var(--ui-color-grey-700);

    .part {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 4px;

      .icon {
        width: 14px;
        height: 14px;
      }

      &.liking {
        color: var(--ui-color-red-main);
      }

      &.time {
        flex: 1 1 auto;
        display: block; // text-ellipsis does not work on `display: flex` elements
        @include text-ellipsis;
      }
    }
  }
}
</style>
