<template>
  <div class="mobile-game-player">
    <!-- 手机状态栏 -->
    <div class="mobile-status-bar">
      <div class="status-left">
        <span class="time">9:41</span>
      </div>
      <div class="status-center">
        <div class="notch"></div>
      </div>
      <div class="status-right">
        <div class="battery-indicator">
          <div class="battery-level"></div>
        </div>
        <span class="wifi-signal">📶</span>
        <span class="battery-percent">100%</span>
      </div>
    </div>

    <!-- 主游戏内容区域 -->
    <div class="mobile-content">
      <!-- 顶部游戏信息栏 -->
      <header class="game-header" :class="{ hidden: isFullscreen }">
        <div class="header-content">
          <button class="back-btn" @click="goBack">
            <span class="back-icon">←</span>
          </button>
          <div class="game-info">
            <h1 class="game-title">{{ currentGame.name }}</h1>
            <p class="game-author">by {{ currentGame.author }}</p>
          </div>
          <div class="header-actions">
            <button class="share-btn" @click="shareGame">📤</button>
            <button class="more-btn" @click="showMoreOptions">⋯</button>
          </div>
        </div>
      </header>

      <!-- 游戏运行区域 -->
      <div class="game-canvas-area" :class="{ fullscreen: isFullscreen }">
        <!-- 游戏画布占位 -->
        <div class="game-canvas" :class="{ running: gameState === 'running' }">
          <!-- 模拟游戏画面 -->
          <div v-if="gameState === 'initial'" class="game-preview">
            <div class="preview-image">{{ currentGame.emoji }}</div>
            <h3 class="preview-title">{{ currentGame.name }}</h3>
            <p class="preview-desc">{{ currentGame.description }}</p>
            <button class="play-button" @click="startGame">
              <span class="play-icon">▶️</span>
              <span>开始游戏</span>
            </button>
          </div>

          <!-- 游戏运行中的模拟画面 -->
          <div v-else-if="gameState === 'running'" class="game-running">
            <div class="game-scene">
              <!-- 模拟游戏元素 -->
              <div class="game-sprite player" :style="playerPosition">🎮</div>
              <div class="game-sprite enemy" v-for="enemy in enemies" :key="enemy.id" :style="enemy.position">
                {{ enemy.emoji }}
              </div>
              <div class="game-sprite collectible" v-for="item in collectibles" :key="item.id" :style="item.position">
                {{ item.emoji }}
              </div>
              
              <!-- 游戏UI层 -->
              <div class="game-ui">
                <div class="score-display">
                  <span class="score-label">得分</span>
                  <span class="score-value">{{ gameScore }}</span>
                </div>
                <div class="lives-display">
                  <span v-for="life in gameLives" :key="life" class="life-icon">❤️</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 游戏暂停画面 -->
          <div v-else-if="gameState === 'paused'" class="game-paused">
            <div class="pause-overlay">
              <h2>游戏暂停</h2>
              <div class="pause-actions">
                <button class="resume-btn" @click="resumeGame">继续</button>
                <button class="restart-btn" @click="restartGame">重新开始</button>
                <button class="exit-btn" @click="exitGame">退出</button>
              </div>
            </div>
          </div>

          <!-- 游戏结束画面 -->
          <div v-else-if="gameState === 'ended'" class="game-ended">
            <div class="end-overlay">
              <h2>游戏结束</h2>
              <div class="final-score">
                <span class="score-label">最终得分</span>
                <span class="score-value">{{ gameScore }}</span>
              </div>
              <div class="end-actions">
                <button class="restart-btn" @click="restartGame">再玩一次</button>
                <button class="share-score-btn" @click="shareScore">分享成绩</button>
                <button class="exit-btn" @click="exitGame">退出游戏</button>
              </div>
            </div>
          </div>

          <!-- 全屏切换按钮 -->
          <button 
            v-show="gameState === 'running'" 
            class="fullscreen-toggle" 
            @click="toggleFullscreen"
          >
            {{ isFullscreen ? '📱' : '🔳' }}
          </button>
        </div>

        <!-- 移动端游戏控制器 -->
        <div v-if="gameState === 'running' && showControls" class="mobile-controls">
          <!-- 左侧方向控制 -->
          <div class="direction-pad">
            <button class="control-btn up" @touchstart="startInput('up')" @touchend="stopInput('up')">↑</button>
            <div class="horizontal-controls">
              <button class="control-btn left" @touchstart="startInput('left')" @touchend="stopInput('left')">←</button>
              <button class="control-btn right" @touchstart="startInput('right')" @touchend="stopInput('right')">→</button>
            </div>
            <button class="control-btn down" @touchstart="startInput('down')" @touchend="stopInput('down')">↓</button>
          </div>

          <!-- 右侧动作按钮 -->
          <div class="action-buttons">
            <button class="action-btn jump" @touchstart="startInput('jump')" @touchend="stopInput('jump')">跳跃</button>
            <button class="action-btn attack" @touchstart="startInput('attack')" @touchend="stopInput('attack')">攻击</button>
          </div>

          <!-- 中央暂停按钮 -->
          <button class="pause-btn" @click="pauseGame">⏸️</button>
        </div>
      </div>

      <!-- 底部游戏信息（非全屏时显示） -->
      <div v-if="!isFullscreen" class="game-footer">
        <div class="game-stats">
          <div class="stat-item">
            <span class="stat-icon">❤️</span>
            <span class="stat-value">{{ currentGame.likes }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">👁️</span>
            <span class="stat-value">{{ currentGame.views }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">🔄</span>
            <span class="stat-value">{{ currentGame.remixes }}</span>
          </div>
        </div>
        
        <div class="game-actions">
          <button class="action-button like-btn" :class="{ active: isLiked }" @click="toggleLike">
            <span class="btn-icon">❤️</span>
            <span class="btn-text">{{ isLiked ? '已喜欢' : '喜欢' }}</span>
          </button>
          <button class="action-button remix-btn" @click="remixGame">
            <span class="btn-icon">🔄</span>
            <span class="btn-text">改编</span>
          </button>
          <button class="action-button share-btn" @click="shareGame">
            <span class="btn-icon">📤</span>
            <span class="btn-text">分享</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 手机底部指示器 -->
    <div class="mobile-home-indicator"></div>

    <!-- 更多选项弹窗 -->
    <div v-if="showMoreMenu" class="more-menu-overlay" @click="showMoreMenu = false">
      <div class="more-menu" @click.stop>
        <div class="menu-header">
          <h3>游戏选项</h3>
          <button class="close-btn" @click="showMoreMenu = false">×</button>
        </div>
        <div class="menu-items">
          <button class="menu-item" @click="toggleControls">
            <span class="menu-icon">🎮</span>
            <span class="menu-text">{{ showControls ? '隐藏控制器' : '显示控制器' }}</span>
          </button>
          <button class="menu-item" @click="reportGame">
            <span class="menu-icon">🚫</span>
            <span class="menu-text">举报游戏</span>
          </button>
          <button class="menu-item" @click="viewAuthor">
            <span class="menu-icon">👤</span>
            <span class="menu-text">查看作者</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'

// 游戏状态管理
type GameState = 'initial' | 'running' | 'paused' | 'ended'
const gameState = ref<GameState>('initial')
const isFullscreen = ref(false)
const showControls = ref(true)
const showMoreMenu = ref(false)

// 当前游戏信息
const currentGame = reactive({
  name: '太空大冒险',
  author: 'GameMaster',
  description: '在太空中收集星星，避开陨石，看看你能得多少分！',
  emoji: '🚀',
  likes: 1256,
  views: 5437,
  remixes: 89
})

// 游戏数据
const gameScore = ref(0)
const gameLives = ref(3)
const isLiked = ref(false)

// 游戏精灵位置
const playerPosition = ref({ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' })
const enemies = ref([
  { id: 1, emoji: '☄️', position: { left: '20%', top: '30%', transform: 'translate(-50%, -50%)' } },
  { id: 2, emoji: '🌑', position: { left: '80%', top: '70%', transform: 'translate(-50%, -50%)' } }
])
const collectibles = ref([
  { id: 1, emoji: '⭐', position: { left: '30%', top: '20%', transform: 'translate(-50%, -50%)' } },
  { id: 2, emoji: '💎', position: { left: '70%', top: '80%', transform: 'translate(-50%, -50%)' } }
])

// 当前输入状态
const activeInputs = ref(new Set<string>())

// 游戏控制方法
const startGame = () => {
  gameState.value = 'running'
  gameScore.value = 0
  gameLives.value = 3
  startGameLoop()
}

const pauseGame = () => {
  gameState.value = 'paused'
}

const resumeGame = () => {
  gameState.value = 'running'
}

const restartGame = () => {
  gameState.value = 'running'
  gameScore.value = 0
  gameLives.value = 3
}

const exitGame = () => {
  gameState.value = 'initial'
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const toggleControls = () => {
  showControls.value = !showControls.value
  showMoreMenu.value = false
}

// 输入控制
const startInput = (input: string) => {
  activeInputs.value.add(input)
}

const stopInput = (input: string) => {
  activeInputs.value.delete(input)
}

// 游戏循环（模拟）
let gameLoop: number | null = null

const startGameLoop = () => {
  const loop = () => {
    if (gameState.value === 'running') {
      // 模拟游戏逻辑
      updateGame()
      gameLoop = requestAnimationFrame(loop)
    }
  }
  loop()
}

const updateGame = () => {
  // 模拟分数增长
  if (Math.random() < 0.02) {
    gameScore.value += 10
  }
  
  // 模拟游戏结束条件
  if (gameScore.value > 500 && Math.random() < 0.005) {
    gameState.value = 'ended'
  }
}

// 社交功能
const toggleLike = () => {
  isLiked.value = !isLiked.value
  currentGame.likes += isLiked.value ? 1 : -1
}

const shareGame = () => {
  alert('分享游戏功能')
}

const shareScore = () => {
  alert(`我在《${currentGame.name}》中得到了 ${gameScore.value} 分！`)
}

const remixGame = () => {
  alert('改编游戏功能')
}

// 其他功能
const goBack = () => {
  if (gameState.value === 'running') {
    pauseGame()
  } else {
    alert('返回游戏列表')
  }
}

const showMoreOptions = () => {
  showMoreMenu.value = true
}

const reportGame = () => {
  alert('举报游戏功能')
  showMoreMenu.value = false
}

const viewAuthor = () => {
  alert('查看作者资料')
  showMoreMenu.value = false
}

// 清理资源
onUnmounted(() => {
  if (gameLoop) {
    cancelAnimationFrame(gameLoop)
  }
})
</script>

<style lang="scss" scoped>
.mobile-game-player {
  width: 375px;
  height: 812px;
  background: #000;
  border-radius: 40px;
  padding: 8px;
  margin: 20px auto;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.mobile-status-bar {
  height: 44px;
  background: #fff;
  border-radius: 32px 32px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 600;
  position: relative;

  .status-center {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    
    .notch {
      width: 150px;
      height: 30px;
      background: #000;
      border-radius: 0 0 20px 20px;
    }
  }

  .status-right {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
  }

  .battery-indicator {
    width: 24px;
    height: 12px;
    border: 1px solid #000;
    border-radius: 2px;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      right: -3px;
      top: 3px;
      width: 2px;
      height: 6px;
      background: #000;
      border-radius: 0 1px 1px 0;
    }
    
    .battery-level {
      width: 80%;
      height: 100%;
      background: #4CAF50;
      border-radius: 1px;
    }
  }
}

.mobile-content {
  height: calc(100% - 44px - 8px);
  background: #000;
  border-radius: 0 0 32px 32px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.game-header {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  position: relative;
  z-index: 10;
  transition: all 0.3s;

  &.hidden {
    transform: translateY(-100%);
    opacity: 0;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .back-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 20px;
    width: 40px;
    height: 40px;
    color: white;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .game-info {
    flex: 1;
    text-align: center;
    color: white;
    margin: 0 16px;

    .game-title {
      font-size: 16px;
      font-weight: 700;
      margin: 0;
      line-height: 1.2;
    }

    .game-author {
      font-size: 12px;
      opacity: 0.8;
      margin: 2px 0 0 0;
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;

    button {
      width: 36px;
      height: 36px;
      border: none;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 18px;
      color: white;
      font-size: 14px;
      cursor: pointer;
    }
  }
}

.game-canvas-area {
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);

  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    border-radius: 0;
  }
}

.game-canvas {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  margin: 8px;
  width: calc(100% - 16px);
  height: calc(100% - 16px);

  .fullscreen & {
    margin: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
}

.game-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  text-align: center;
  padding: 40px 20px;

  .preview-image {
    font-size: 80px;
    margin-bottom: 20px;
  }

  .preview-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 12px 0;
  }

  .preview-desc {
    font-size: 14px;
    opacity: 0.8;
    margin: 0 0 32px 0;
    line-height: 1.5;
  }

  .play-button {
    background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
    border: none;
    border-radius: 30px;
    padding: 16px 32px;
    color: white;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 107, 107, 0.5);
    }

    .play-icon {
      font-size: 20px;
    }
  }
}

.game-running {
  width: 100%;
  height: 100%;
  position: relative;
  background: radial-gradient(ellipse at center, #1a237e 0%, #000051 100%);
  overflow: hidden;
}

.game-scene {
  width: 100%;
  height: 100%;
  position: relative;
}

.game-sprite {
  position: absolute;
  font-size: 32px;
  transition: all 0.2s;
  z-index: 5;

  &.player {
    z-index: 10;
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
  }
}

.game-ui {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  z-index: 15;

  .score-display {
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 600;

    .score-label {
      font-size: 12px;
      opacity: 0.8;
      margin-right: 8px;
    }

    .score-value {
      font-size: 16px;
    }
  }

  .lives-display {
    display: flex;
    gap: 4px;

    .life-icon {
      font-size: 20px;
      filter: drop-shadow(0 0 4px rgba(255, 0, 0, 0.8));
    }
  }
}

.game-paused,
.game-ended {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.pause-overlay,
.end-overlay {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  min-width: 280px;

  h2 {
    margin: 0 0 24px 0;
    font-size: 24px;
    color: #333;
  }

  .final-score {
    margin-bottom: 24px;
    
    .score-label {
      display: block;
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .score-value {
      font-size: 32px;
      font-weight: 700;
      color: #ff6b6b;
    }
  }
}

.pause-actions,
.end-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;

  button {
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &.resume-btn,
    &.restart-btn {
      background: #4CAF50;
      color: white;

      &:hover {
        background: #45a049;
      }
    }

    &.share-score-btn {
      background: #2196F3;
      color: white;

      &:hover {
        background: #1976D2;
      }
    }

    &.exit-btn {
      background: #f44336;
      color: white;

      &:hover {
        background: #d32f2f;
      }
    }
  }
}

.fullscreen-toggle {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 22px;
  color: white;
  font-size: 18px;
  cursor: pointer;
  z-index: 15;
  backdrop-filter: blur(10px);
}

.mobile-controls {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  z-index: 15;
  pointer-events: none;

  .fullscreen & {
    bottom: 40px;
  }

  * {
    pointer-events: auto;
  }
}

.direction-pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .horizontal-controls {
    display: flex;
    gap: 40px;
  }

  .control-btn {
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 25px;
    font-size: 20px;
    font-weight: 700;
    color: #333;
    cursor: pointer;
    user-select: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.1s;

    &:active {
      transform: scale(0.9);
      background: rgba(255, 255, 255, 1);
    }
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .action-btn {
    width: 60px;
    height: 60px;
    background: rgba(255, 107, 107, 0.9);
    border: none;
    border-radius: 30px;
    color: white;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    user-select: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.1s;

    &:active {
      transform: scale(0.9);
      background: rgba(255, 107, 107, 1);
    }

    &.jump {
      background: rgba(76, 175, 80, 0.9);

      &:active {
        background: rgba(76, 175, 80, 1);
      }
    }
  }
}

.pause-btn {
  position: absolute;
  left: 50%;
  bottom: 100px;
  transform: translateX(-50%);
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.8);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 20px;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.game-footer {
  background: rgba(0, 0, 0, 0.9);
  padding: 16px 20px;
  border-radius: 16px 16px 0 0;
  margin-top: auto;

  .game-stats {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-bottom: 16px;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: white;
      font-size: 14px;

      .stat-icon {
        font-size: 16px;
      }
    }
  }

  .game-actions {
    display: flex;
    justify-content: space-around;

    .action-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 12px;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &.active {
        color: #ff6b6b;
      }

      .btn-icon {
        font-size: 20px;
      }

      .btn-text {
        font-size: 12px;
        font-weight: 600;
      }
    }
  }
}

.mobile-home-indicator {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 134px;
  height: 5px;
  background: #fff;
  border-radius: 3px;
}

.more-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.more-menu {
  background: white;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 359px;
  padding: 20px;

  .menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      color: #666;
      cursor: pointer;
    }
  }

  .menu-items {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .menu-item {
      display: flex;
      align-items: center;
      gap: 16px;
      background: none;
      border: none;
      padding: 16px;
      border-radius: 12px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background: #f5f5f5;
      }

      .menu-icon {
        font-size: 20px;
        width: 24px;
        text-align: center;
      }

      .menu-text {
        flex: 1;
        text-align: left;
        font-size: 16px;
        color: #333;
      }
    }
  }
}
</style>
