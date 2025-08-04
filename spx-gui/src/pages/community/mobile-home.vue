<template>
  <div class="mobile-home-page">
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

    <!-- 主内容区域 -->
    <div class="mobile-content">
      <!-- 头部导航 -->
      <header class="mobile-header">
        <div class="header-content">
          <h1 class="app-title">XBuilder</h1>
          <div class="header-actions">
            <button class="search-btn">🔍</button>
            <button class="notification-btn">🔔</button>
          </div>
        </div>
      </header>

      <!-- 滚动内容 -->
      <div class="scrollable-content">
        <!-- 访客横幅 (未登录时显示) -->
        <div v-if="!isSignedIn()" class="mobile-guest-banner">
          <div class="banner-content">
            <h2>欢迎来到 XBuilder</h2>
            <p>发现创意编程的无限可能</p>
            <div class="banner-actions">
              <button class="btn-primary">登录</button>
              <button class="btn-secondary">注册</button>
            </div>
          </div>
        </div>

        <!-- 我的项目区域 -->
        <section v-if="isSignedIn()" class="mobile-section">
          <div class="section-header">
            <h3 class="section-title">你的项目</h3>
            <button class="view-all-btn">查看所有 →</button>
          </div>
          <div class="mobile-projects-grid">
            <div 
              v-for="project in mockMyProjects" 
              :key="project.id" 
              class="mobile-project-card"
            >
              <div class="project-thumbnail">
                <div class="thumbnail-placeholder">🎮</div>
                <div class="project-options">⋯</div>
              </div>
              <div class="project-info">
                <h4 class="project-name">{{ project.name }}</h4>
                <p class="project-meta">{{ project.updatedAt }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 社区喜欢的项目 -->
        <section class="mobile-section">
          <div class="section-header">
            <h3 class="section-title">大家喜欢的</h3>
            <button class="view-all-btn">查看更多 →</button>
          </div>
          <div class="mobile-projects-grid">
            <div 
              v-for="project in mockCommunityProjects" 
              :key="project.id" 
              class="mobile-project-card"
            >
              <div class="project-thumbnail">
                <div class="thumbnail-placeholder">{{ project.emoji }}</div>
                <div class="project-stats">
                  <span class="likes">❤️ {{ project.likes }}</span>
                </div>
              </div>
              <div class="project-info">
                <h4 class="project-name">{{ project.name }}</h4>
                <p class="project-author">by {{ project.author }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 大家在改编 -->
        <section class="mobile-section">
          <div class="section-header">
            <h3 class="section-title">大家在改编</h3>
            <button class="view-all-btn">查看更多 →</button>
          </div>
          <div class="mobile-projects-grid">
            <div 
              v-for="project in mockRemixProjects" 
              :key="project.id" 
              class="mobile-project-card"
            >
              <div class="project-thumbnail">
                <div class="thumbnail-placeholder">{{ project.emoji }}</div>
                <div class="project-stats">
                  <span class="remixes">🔄 {{ project.remixes }}</span>
                </div>
              </div>
              <div class="project-info">
                <h4 class="project-name">{{ project.name }}</h4>
                <p class="project-author">by {{ project.author }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 关注用户创作 -->
        <section v-if="isSignedIn()" class="mobile-section">
          <div class="section-header">
            <h3 class="section-title">你关注的用户在创作</h3>
            <button class="view-all-btn">查看更多 →</button>
          </div>
          <div class="mobile-projects-grid">
            <div 
              v-for="project in mockFollowingProjects" 
              :key="project.id" 
              class="mobile-project-card"
            >
              <div class="project-thumbnail">
                <div class="thumbnail-placeholder">{{ project.emoji }}</div>
                <div class="author-avatar">{{ project.author[0] }}</div>
              </div>
              <div class="project-info">
                <h4 class="project-name">{{ project.name }}</h4>
                <p class="project-author">by {{ project.author }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 底部间距 -->
        <div class="bottom-spacer"></div>
      </div>

      <!-- 底部导航栏 -->
      <nav class="mobile-bottom-nav">
        <div class="nav-item active">
          <span class="nav-icon">🏠</span>
          <span class="nav-label">首页</span>
        </div>
        <div class="nav-item">
          <span class="nav-icon">🎯</span>
          <span class="nav-label">探索</span>
        </div>
        <div class="nav-item">
          <span class="nav-icon">➕</span>
          <span class="nav-label">创建</span>
        </div>
        <div class="nav-item">
          <span class="nav-icon">👥</span>
          <span class="nav-label">社区</span>
        </div>
        <div class="nav-item">
          <span class="nav-icon">👤</span>
          <span class="nav-label">我的</span>
        </div>
      </nav>
    </div>

    <!-- 手机底部指示器 -->
    <div class="mobile-home-indicator"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 模拟登录状态
const isSignedIn = () => true // 可以改为 false 测试访客状态

// 模拟数据
const mockMyProjects = ref([
  { id: 1, name: '我的第一个游戏', updatedAt: '2天前' },
  { id: 2, name: '弹球大冒险', updatedAt: '5天前' },
  { id: 3, name: '音乐节拍器', updatedAt: '1周前' },
  { id: 4, name: '数字猜谜', updatedAt: '2周前' }
])

const mockCommunityProjects = ref([
  { id: 1, name: '太空大战', author: 'Alex', likes: 156, emoji: '🚀' },
  { id: 2, name: '跳跃小人', author: 'Sarah', likes: 89, emoji: '🤸' },
  { id: 3, name: '彩虹画笔', author: 'Mike', likes: 234, emoji: '🌈' },
  { id: 4, name: '音乐制作器', author: 'Luna', likes: 67, emoji: '🎵' }
])

const mockRemixProjects = ref([
  { id: 1, name: '超级马里奥重制', author: 'GameDev', remixes: 45, emoji: '🍄' },
  { id: 2, name: '像素艺术工具', author: 'Artist', remixes: 32, emoji: '🎨' },
  { id: 3, name: '虚拟钢琴', author: 'Musician', remixes: 28, emoji: '🎹' },
  { id: 4, name: '记忆卡片游戏', author: 'Brain', remixes: 19, emoji: '🧠' }
])

const mockFollowingProjects = ref([
  { id: 1, name: '新创意实验', author: 'Creative', emoji: '💡' },
  { id: 2, name: '3D 动画秀', author: 'Animator', emoji: '🎬' },
  { id: 3, name: '互动故事', author: 'Writer', emoji: '📚' },
  { id: 4, name: '科学模拟器', author: 'Scientist', emoji: '🔬' }
])
</script>

<style lang="scss" scoped>
.mobile-home-page {
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
  background: #f8f9fa;
  border-radius: 0 0 32px 32px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mobile-header {
  background: #fff;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .app-title {
    font-size: 24px;
    font-weight: 700;
    color: #333;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 12px;

    button {
      width: 40px;
      height: 40px;
      border: none;
      background: #f5f5f5;
      border-radius: 20px;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #e9ecef;
        transform: scale(1.05);
      }
    }
  }
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 0 80px 0;
}

.mobile-guest-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin: 16px;
  border-radius: 16px;
  padding: 24px;
  text-align: center;

  h2 {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 700;
  }

  p {
    margin: 0 0 20px 0;
    opacity: 0.9;
    font-size: 14px;
  }

  .banner-actions {
    display: flex;
    gap: 12px;
    justify-content: center;

    button {
      padding: 10px 20px;
      border: none;
      border-radius: 20px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &.btn-primary {
        background: #fff;
        color: #667eea;
      }

      &.btn-secondary {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      &:hover {
        transform: translateY(-1px);
      }
    }
  }
}

.mobile-section {
  margin: 16px 0;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px 12px;

    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #333;
      margin: 0;
    }

    .view-all-btn {
      background: none;
      border: none;
      color: #667eea;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 0;

      &:hover {
        opacity: 0.8;
      }
    }
  }
}

.mobile-projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 20px;
}

.mobile-project-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .project-thumbnail {
    height: 100px;
    background: #f8f9fa;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    .thumbnail-placeholder {
      font-size: 32px;
    }

    .project-options {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 12px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      cursor: pointer;
    }

    .project-stats {
      position: absolute;
      bottom: 8px;
      left: 8px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
    }

    .author-avatar {
      position: absolute;
      top: 8px;
      left: 8px;
      width: 24px;
      height: 24px;
      background: #667eea;
      color: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 700;
    }
  }

  .project-info {
    padding: 12px;

    .project-name {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin: 0 0 4px 0;
      line-height: 1.2;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .project-meta,
    .project-author {
      font-size: 12px;
      color: #666;
      margin: 0;
    }
  }
}

.mobile-bottom-nav {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  height: 72px;
  background: #fff;
  border-radius: 0 0 32px 32px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.2s;
    padding: 8px;
    border-radius: 12px;

    &.active {
      background: #f0f3ff;
      color: #667eea;
    }

    &:hover:not(.active) {
      background: #f8f9fa;
    }

    .nav-icon {
      font-size: 20px;
    }

    .nav-label {
      font-size: 10px;
      font-weight: 600;
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

.bottom-spacer {
  height: 20px;
}

/* 滚动条样式 */
.scrollable-content::-webkit-scrollbar {
  display: none;
}

.scrollable-content {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
