<template>
  <div class="poster-background">
    <div class="screenshot-area">
      <img v-if="imgSrc" :src="imgSrc" :alt="imgAlt" class="screenshot-image" />
      <div v-else class="screenshot-placeholder">
        <UIIcon type="file" />
        <span>{{ $t({ en: 'No image', zh: '暂无图片' }) }}</span>
      </div>
    </div>
    <div class="poster-decoration">
      <div class="project-info">
        <div class="game-title">{{ projectName }}</div>
        <div v-if="creatorName" class="creator-info">
          <UIIcon type="user" />
          <span>{{ $t({ en: 'Created by', zh: '创作者' }) }}: {{ creatorName }}</span>
        </div>
        <div class="project-stats" v-if="stats">
          <div class="stat-item" v-if="stats.viewCount">
            <UIIcon type="eye" />
            <span>{{ stats.viewCount }}</span>
          </div>
          <div class="stat-item" v-if="stats.likeCount">
            <UIIcon type="heart" />
            <span>{{ stats.likeCount }}</span>
          </div>
          <div class="stat-item" v-if="stats.remixCount">
            <UIIcon type="remix" />
            <span>{{ stats.remixCount }}</span>
          </div>
        </div>
      </div>
      <div style="display: flex; align-items: flex-start; gap: 16px;">
        <div class="branding">
          <img :src="logoSrc" alt="logo" class="branding-logo" style="height: 40px; vertical-align: middle;" />
        </div>
        <div v-if="showQr" class="project-qrcode">
          <canvas ref="projectQrCanvas" class="project-qr-canvas"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { UIIcon } from '@/components/ui'
import { generateProjectQRCode } from '@/utils/qrcode'

const props = defineProps<{
  imgSrc?: string
  imgAlt?: string
  projectName?: string
  creatorName?: string
  stats?: {
    viewCount?: string | number
    likeCount?: string | number
    remixCount?: string | number
  }
  logoSrc?: string
  showQr?: boolean
  projectUrl?: string
}>()

const projectQrCanvas = ref<HTMLCanvasElement>()

// 获取当前项目URL
const getCurrentProjectUrl = () => {
  if (props.projectUrl) {
    return props.projectUrl
  }
  return window.location.origin + window.location.pathname
}

// 渲染二维码到canvas
const drawQRCodeToCanvas = async (canvas: HTMLCanvasElement, url: string) => {
  if (!canvas) return
  
  try {
    // 获取CSS中定义的尺寸
    const computedStyle = window.getComputedStyle(canvas)
    const displayWidth = parseInt(computedStyle.width) || 60
    const displayHeight = parseInt(computedStyle.height) || 60
    
    // 计算设备像素比，确保高分辨率显示
    const devicePixelRatio = window.devicePixelRatio || 1
    const pixelRatio = Math.max(devicePixelRatio, 2) // 至少2倍分辨率
    
    // 设置canvas的实际像素尺寸（高分辨率）
    canvas.width = displayWidth * pixelRatio
    canvas.height = displayHeight * pixelRatio
    
    // 使用qrcode工具生成高分辨率二维码
    const qrSize = Math.min(displayWidth, displayHeight) * pixelRatio
    const dataUrl = await generateProjectQRCode({
      projectName: props.projectName || '',
      projectUrl: url,
    }, { 
      width: qrSize, 
      margin: 2 // 添加一些边距确保二维码完整显示
    })
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // 设置高分辨率渲染
      ctx.scale(pixelRatio, pixelRatio)
      
      const img = new window.Image()
      img.onload = () => {
        // 清除canvas
        ctx.clearRect(0, 0, displayWidth, displayHeight)
        
        // 计算居中位置
        const imgSize = Math.min(displayWidth, displayHeight)
        const x = (displayWidth - imgSize) / 2
        const y = (displayHeight - imgSize) / 2
        
        // 绘制二维码
        ctx.drawImage(img, x, y, imgSize, imgSize)
      }
      img.src = dataUrl
    }
  } catch (error) {
    console.error('生成二维码失败:', error)
  }
}

// 生成二维码
const generateQRCode = async () => {
  if (projectQrCanvas.value && props.showQr) {
    const currentUrl = getCurrentProjectUrl()
    await drawQRCodeToCanvas(projectQrCanvas.value, currentUrl)
  }
}

// 监听属性变化，重新生成二维码
watch(() => [props.showQr, props.projectName, props.projectUrl], () => {
  nextTick(() => {
    generateQRCode()
  })
})

onMounted(() => {
  if (props.showQr && projectQrCanvas.value) {
    nextTick(() => {
      generateQRCode()
    })
  }
})
</script>

<style scoped lang="scss">
.poster-background {
  width: 100%;
  height: 100%;
  background-image: url('@/assets/images/postBackground.jpg');
  background-size: cover;
  background-position: center;
  border-radius: 16px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  /* box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15); */
  transition: all 0.3s ease;
  max-height: 400px;
}

.screenshot-area {
  flex: 1;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 24px;
  position: relative;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(0, 0, 0, 0.02) 100%);
    pointer-events: none;
  }
}

.screenshot-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.screenshot-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--ui-color-hint-2);
  
  :deep(.ui-icon) {
    width: 48px;
    height: 48px;
  }
}

.poster-decoration {
  color: white;
  text-align: left;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 1;
}

.project-info {
  flex: 1;
}

.game-title {
  font-size: 19px;
  font-weight: 800;
  margin-bottom: 8px;
  line-height: 1.3;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  letter-spacing: -0.02em;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  margin-bottom: 12px;
  opacity: 0.9;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  :deep(.ui-icon) {
    width: 14px;
    height: 14px;
    opacity: 0.8;
  }
  
  span {
    font-weight: 500;
    letter-spacing: -0.01em;
  }
}

.project-stats {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  opacity: 0.98;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  border-radius: 16px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }
  
  :deep(.ui-icon) {
    width: 14px;
    height: 14px;
    opacity: 0.95;
  }
  
  span {
    font-weight: 700;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    letter-spacing: -0.01em;
  }
}

.branding {
  display: flex;
  align-items: center;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  padding: 12px 20px;
  border-radius: 24px;
  backdrop-filter: blur(4px);
  box-sizing: border-box;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }
}

.project-qrcode {
  display: flex;
  align-items: center;
  height: 60px;
  min-width: 60px;
}

.project-qr-canvas {
  width: 60px;
  height: 60px;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}
</style>
