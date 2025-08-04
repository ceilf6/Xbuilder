<template>
  <div class="mobile-prototype-container">
    <!-- 手机外壳 -->
    <div class="phone-frame">
      <!-- 手机头部 -->
      <div class="phone-header">
        <div class="speaker"></div>
        <div class="camera"></div>
      </div>
      
      <!-- 手机屏幕 -->
      <div class="phone-screen">
        <!-- 状态栏 -->
        <div class="status-bar">
          <div class="status-left">
            <span class="time">9:41</span>
          </div>
          <div class="status-right">
            <div class="signal-bars">
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
            </div>
            <div class="wifi-icon">📶</div>
            <div class="battery">
              <div class="battery-level"></div>
            </div>
          </div>
        </div>

        <!-- 应用内容区域 -->
        <div class="app-content">
          <!-- 顶部导航栏 -->
          <div class="top-nav">
            <div class="nav-left">
              <button class="back-btn">←</button>
            </div>
            <div class="nav-center">
              <h1 class="page-title">{{ currentPageTitle }}</h1>
            </div>
            <div class="nav-right">
              <button class="menu-btn">⋯</button>
            </div>
          </div>

          <!-- 页面内容 -->
          <div class="page-content">
            <!-- 首页内容 -->
            <div v-if="currentPage === 'home'" class="home-page">
              <div class="welcome-banner">
                <h2>欢迎使用 SPX</h2>
                <p>创建你的第一个项目</p>
              </div>
              
              <div class="quick-actions">
                <div class="action-card" @click="currentPage = 'projects'">
                  <div class="action-icon">🎮</div>
                  <span>我的项目</span>
                </div>
                <div class="action-card" @click="currentPage = 'community'">
                  <div class="action-icon">👥</div>
                  <span>社区</span>
                </div>
                <div class="action-card" @click="currentPage = 'create'">
                  <div class="action-icon">➕</div>
                  <span>新建项目</span>
                </div>
                <div class="action-card" @click="currentPage = 'profile'">
                  <div class="action-icon">👤</div>
                  <span>个人中心</span>
                </div>
              </div>

              <div class="recent-projects">
                <h3>最近项目</h3>
                <div class="project-list">
                  <div class="project-item" v-for="i in 3" :key="i">
                    <div class="project-thumbnail"></div>
                    <div class="project-info">
                      <h4>项目 {{ i }}</h4>
                      <p>2 小时前</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 项目页面 -->
            <div v-if="currentPage === 'projects'" class="projects-page">
              <div class="page-header">
                <h2>我的项目</h2>
                <button class="create-btn">+ 新建</button>
              </div>
              
              <div class="filter-tabs">
                <button class="tab active">全部</button>
                <button class="tab">最近</button>
                <button class="tab">已发布</button>
              </div>

              <div class="projects-grid">
                <div class="project-card" v-for="i in 6" :key="i">
                  <div class="card-thumbnail"></div>
                  <div class="card-content">
                    <h4>游戏项目 {{ i }}</h4>
                    <p>{{ i === 1 ? '1 分钟前' : i === 2 ? '1 小时前' : `${i} 天前` }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 社区页面 -->
            <div v-if="currentPage === 'community'" class="community-page">
              <div class="search-bar">
                <input type="text" placeholder="搜索项目或用户...">
              </div>

              <div class="category-chips">
                <span class="chip active">推荐</span>
                <span class="chip">最新</span>
                <span class="chip">热门</span>
                <span class="chip">游戏</span>
              </div>

              <div class="community-feed">
                <div class="feed-item" v-for="i in 4" :key="i">
                  <div class="user-info">
                    <div class="avatar"></div>
                    <div class="user-details">
                      <h4>用户{{ i }}</h4>
                      <p>{{ i }} 小时前</p>
                    </div>
                  </div>
                  <div class="project-preview"></div>
                  <div class="interaction-bar">
                    <button class="like-btn">❤️ {{ 10 + i }}</button>
                    <button class="comment-btn">💬 {{ i * 2 }}</button>
                    <button class="share-btn">📤</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 创建页面 -->
            <div v-if="currentPage === 'create'" class="create-page">
              <div class="create-header">
                <h2>创建新项目</h2>
              </div>

              <div class="template-selection">
                <h3>选择模板</h3>
                <div class="template-grid">
                  <div class="template-card" v-for="template in templates" :key="template.id">
                    <div class="template-preview"></div>
                    <h4>{{ template.name }}</h4>
                    <p>{{ template.description }}</p>
                  </div>
                </div>
              </div>

              <div class="project-settings">
                <h3>项目设置</h3>
                <div class="form-group">
                  <label>项目名称</label>
                  <input type="text" placeholder="输入项目名称">
                </div>
                <div class="form-group">
                  <label>项目描述</label>
                  <textarea placeholder="描述你的项目..."></textarea>
                </div>
                <button class="create-project-btn">创建项目</button>
              </div>
            </div>

            <!-- 个人中心页面 -->
            <div v-if="currentPage === 'profile'" class="profile-page">
              <div class="profile-header">
                <div class="profile-avatar"></div>
                <h2>用户名</h2>
                <p>@username</p>
              </div>

              <div class="profile-stats">
                <div class="stat">
                  <span class="number">12</span>
                  <span class="label">项目</span>
                </div>
                <div class="stat">
                  <span class="number">156</span>
                  <span class="label">关注者</span>
                </div>
                <div class="stat">
                  <span class="number">89</span>
                  <span class="label">关注中</span>
                </div>
              </div>

              <div class="profile-menu">
                <div class="menu-item">
                  <span>📊 数据统计</span>
                  <span>></span>
                </div>
                <div class="menu-item">
                  <span>⚙️ 设置</span>
                  <span>></span>
                </div>
                <div class="menu-item">
                  <span>❓ 帮助与反馈</span>
                  <span>></span>
                </div>
                <div class="menu-item">
                  <span>🔐 隐私政策</span>
                  <span>></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部导航栏 -->
      <div class="bottom-nav">
        <div class="nav-item" :class="{ active: currentPage === 'home' }" @click="currentPage = 'home'">
          <div class="nav-icon">🏠</div>
          <span>首页</span>
        </div>
        <div class="nav-item" :class="{ active: currentPage === 'projects' }" @click="currentPage = 'projects'">
          <div class="nav-icon">📁</div>
          <span>项目</span>
        </div>
        <div class="nav-item" :class="{ active: currentPage === 'community' }" @click="currentPage = 'community'">
          <div class="nav-icon">👥</div>
          <span>社区</span>
        </div>
        <div class="nav-item" :class="{ active: currentPage === 'profile' }" @click="currentPage = 'profile'">
          <div class="nav-icon">👤</div>
          <span>我的</span>
        </div>
      </div>

      <!-- 手机底部 -->
      <div class="phone-footer">
        <div class="home-indicator"></div>
      </div>
    </div>

    <!-- 页面切换控制 -->
    <div class="prototype-controls">
      <h3>原型控制面板</h3>
      <div class="control-buttons">
        <button 
          v-for="page in pages" 
          :key="page.id" 
          :class="{ active: currentPage === page.id }"
          @click="currentPage = page.id"
        >
          {{ page.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const currentPage = ref('home')

const pages = [
  { id: 'home', name: '首页' },
  { id: 'projects', name: '项目' },
  { id: 'community', name: '社区' },
  { id: 'create', name: '创建' },
  { id: 'profile', name: '个人中心' }
]

const templates = [
  { id: 1, name: '空白项目', description: '从零开始创建' },
  { id: 2, name: '游戏模板', description: '包含基础游戏逻辑' },
  { id: 3, name: '教学模板', description: '适合学习使用' },
  { id: 4, name: '动画模板', description: '创建动画作品' }
]

const currentPageTitle = computed(() => {
  const page = pages.find(p => p.id === currentPage.value)
  return page?.name || '首页'
})
</script>

<style lang="scss" scoped>
.mobile-prototype-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 40px;
}

.phone-frame {
  width: 375px;
  height: 812px;
  background: #1c1c1e;
  border-radius: 40px;
  padding: 8px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
}

.phone-header {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 80px;
  
  .speaker {
    width: 60px;
    height: 6px;
    background: #333;
    border-radius: 3px;
  }
  
  .camera {
    width: 12px;
    height: 12px;
    background: #333;
    border-radius: 50%;
  }
}

.phone-screen {
  background: #000;
  border-radius: 32px;
  height: calc(100% - 60px);
  overflow: hidden;
  position: relative;
}

.status-bar {
  height: 44px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  
  .status-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .signal-bars {
    display: flex;
    gap: 2px;
    
    .bar {
      width: 3px;
      background: white;
      border-radius: 1px;
      
      &:nth-child(1) { height: 4px; }
      &:nth-child(2) { height: 6px; }
      &:nth-child(3) { height: 8px; }
      &:nth-child(4) { height: 10px; }
    }
  }
  
  .battery {
    width: 24px;
    height: 12px;
    border: 1px solid white;
    border-radius: 2px;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      right: -3px;
      top: 3px;
      width: 2px;
      height: 6px;
      background: white;
      border-radius: 0 1px 1px 0;
    }
    
    .battery-level {
      background: #4cd964;
      height: 100%;
      width: 80%;
      border-radius: 1px;
    }
  }
}

.app-content {
  height: calc(100% - 44px - 83px);
  background: white;
  overflow-y: auto;
}

.top-nav {
  height: 44px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #e9ecef;
  
  .nav-left, .nav-right {
    width: 40px;
  }
  
  .nav-center {
    flex: 1;
    text-align: center;
    
    .page-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }
  }
  
  .back-btn, .menu-btn {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
  }
}

.page-content {
  padding: 16px;
  height: calc(100% - 44px);
  overflow-y: auto;
}

// 首页样式
.home-page {
  .welcome-banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 24px;
    border-radius: 12px;
    text-align: center;
    margin-bottom: 24px;
    
    h2 {
      margin: 0 0 8px;
      font-size: 24px;
    }
    
    p {
      margin: 0;
      opacity: 0.9;
    }
  }
  
  .quick-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
    
    .action-card {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .action-icon {
        font-size: 32px;
        margin-bottom: 8px;
      }
      
      span {
        font-weight: 500;
      }
    }
  }
  
  .recent-projects {
    h3 {
      margin-bottom: 16px;
      font-size: 18px;
    }
    
    .project-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      
      .project-item {
        display: flex;
        align-items: center;
        background: white;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 12px;
        
        .project-thumbnail {
          width: 48px;
          height: 48px;
          background: #f8f9fa;
          border-radius: 6px;
          margin-right: 12px;
        }
        
        .project-info {
          h4 {
            margin: 0 0 4px;
            font-size: 16px;
          }
          
          p {
            margin: 0;
            color: #6c757d;
            font-size: 14px;
          }
        }
      }
    }
  }
}

// 项目页面样式
.projects-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      font-size: 24px;
    }
    
    .create-btn {
      background: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-weight: 500;
      cursor: pointer;
    }
  }
  
  .filter-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    
    .tab {
      background: none;
      border: 1px solid #dee2e6;
      border-radius: 20px;
      padding: 8px 16px;
      cursor: pointer;
      
      &.active {
        background: #007bff;
        color: white;
        border-color: #007bff;
      }
    }
  }
  
  .projects-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    
    .project-card {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
      
      .card-thumbnail {
        height: 100px;
        background: #f8f9fa;
      }
      
      .card-content {
        padding: 12px;
        
        h4 {
          margin: 0 0 4px;
          font-size: 14px;
        }
        
        p {
          margin: 0;
          color: #6c757d;
          font-size: 12px;
        }
      }
    }
  }
}

// 社区页面样式
.community-page {
  .search-bar {
    margin-bottom: 16px;
    
    input {
      width: 100%;
      padding: 12px;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      font-size: 16px;
      
      &::placeholder {
        color: #6c757d;
      }
    }
  }
  
  .category-chips {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    overflow-x: auto;
    
    .chip {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 16px;
      padding: 6px 12px;
      font-size: 14px;
      white-space: nowrap;
      cursor: pointer;
      
      &.active {
        background: #007bff;
        color: white;
        border-color: #007bff;
      }
    }
  }
  
  .community-feed {
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    .feed-item {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 12px;
      
      .user-info {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        
        .avatar {
          width: 32px;
          height: 32px;
          background: #6c757d;
          border-radius: 50%;
          margin-right: 8px;
        }
        
        .user-details h4 {
          margin: 0;
          font-size: 14px;
        }
        
        .user-details p {
          margin: 0;
          color: #6c757d;
          font-size: 12px;
        }
      }
      
      .project-preview {
        height: 120px;
        background: #f8f9fa;
        border-radius: 6px;
        margin-bottom: 12px;
      }
      
      .interaction-bar {
        display: flex;
        gap: 16px;
        
        button {
          background: none;
          border: none;
          font-size: 14px;
          color: #6c757d;
          cursor: pointer;
        }
      }
    }
  }
}

// 创建页面样式
.create-page {
  .create-header {
    margin-bottom: 24px;
    
    h2 {
      margin: 0;
      font-size: 24px;
    }
  }
  
  .template-selection {
    margin-bottom: 24px;
    
    h3 {
      margin-bottom: 16px;
      font-size: 18px;
    }
    
    .template-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      
      .template-card {
        background: white;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 12px;
        text-align: center;
        cursor: pointer;
        
        .template-preview {
          height: 60px;
          background: #f8f9fa;
          border-radius: 4px;
          margin-bottom: 8px;
        }
        
        h4 {
          margin: 0 0 4px;
          font-size: 14px;
        }
        
        p {
          margin: 0;
          color: #6c757d;
          font-size: 12px;
        }
      }
    }
  }
  
  .project-settings {
    h3 {
      margin-bottom: 16px;
      font-size: 18px;
    }
    
    .form-group {
      margin-bottom: 16px;
      
      label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
      }
      
      input, textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        font-size: 16px;
      }
      
      textarea {
        height: 80px;
        resize: vertical;
      }
    }
    
    .create-project-btn {
      width: 100%;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
    }
  }
}

// 个人中心页面样式
.profile-page {
  .profile-header {
    text-align: center;
    margin-bottom: 24px;
    
    .profile-avatar {
      width: 80px;
      height: 80px;
      background: #6c757d;
      border-radius: 50%;
      margin: 0 auto 12px;
    }
    
    h2 {
      margin: 0 0 4px;
      font-size: 24px;
    }
    
    p {
      margin: 0;
      color: #6c757d;
    }
  }
  
  .profile-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 24px;
    padding: 16px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    
    .stat {
      text-align: center;
      
      .number {
        display: block;
        font-size: 20px;
        font-weight: 600;
      }
      
      .label {
        color: #6c757d;
        font-size: 14px;
      }
    }
  }
  
  .profile-menu {
    .menu-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      
      &:hover {
        background: #f8f9fa;
      }
    }
  }
}

.bottom-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 83px;
  background: white;
  border-top: 1px solid #e9ecef;
  display: flex;
  padding-bottom: 34px;
  
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #6c757d;
    transition: color 0.2s;
    
    &.active {
      color: #007bff;
    }
    
    .nav-icon {
      font-size: 20px;
      margin-bottom: 4px;
    }
    
    span {
      font-size: 12px;
    }
  }
}

.phone-footer {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .home-indicator {
    width: 134px;
    height: 5px;
    background: #333;
    border-radius: 3px;
  }
}

.prototype-controls {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  min-width: 250px;
  
  h3 {
    margin: 0 0 16px;
    font-size: 18px;
    color: #333;
  }
  
  .control-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    button {
      padding: 12px 16px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
      
      &:hover {
        background: #f8f9fa;
      }
      
      &.active {
        background: #007bff;
        color: white;
        border-color: #007bff;
      }
    }
  }
}

@media (max-width: 768px) {
  .mobile-prototype-container {
    flex-direction: column;
    padding: 20px 10px;
    
    .phone-frame {
      transform: scale(0.8);
    }
    
    .prototype-controls {
      width: 100%;
      max-width: 300px;
      transform: scale(0.8);
    }
  }
}
</style>
