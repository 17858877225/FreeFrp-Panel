<template>
  <div class="home">
    <!-- 导航栏 -->
    <n-layout-header class="header" bordered>
      <div class="header-content">
        <div class="logo">
          <h1>FreeFrp</h1>
        </div>
        <div class="nav-menu">
          <n-space>
            <router-link to="/nodes" class="nav-link">节点状态</router-link>
            <router-link to="/download" class="nav-link">客户端下载</router-link>
            <template v-if="userStore.isLoggedIn">
              <router-link to="/dashboard" class="nav-link">用户面板</router-link>
              <n-button @click="userStore.logout" type="error" size="small">退出</n-button>
            </template>
            <template v-else>
              <router-link to="/login">
                <n-button type="primary" size="small">登录</n-button>
              </router-link>
              <router-link to="/register">
                <n-button size="small">注册</n-button>
              </router-link>
            </template>
          </n-space>
        </div>
      </div>
    </n-layout-header>

    <!-- 主要内容 -->
    <div class="main-content">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">FreeFrp</h1>
          <h2 class="hero-subtitle">免费内网穿透服务</h2>
          <p class="hero-description">
            高速稳定的内网穿透服务，支持TCP、UDP、HTTP、HTTPS协议<br />
            让您的本地服务轻松暴露到公网
          </p>
          <div class="hero-actions">
            <template v-if="userStore.isLoggedIn">
              <router-link to="/dashboard">
                <n-button type="primary" size="large">进入控制台</n-button>
              </router-link>
            </template>
            <template v-else>
              <router-link to="/register">
                <n-button type="primary" size="large">免费注册</n-button>
              </router-link>
              <router-link to="/login">
                <n-button size="large">立即登录</n-button>
              </router-link>
            </template>
          </div>
        </div>
      </div>

      <!-- 特性介绍 -->
      <div class="features-section">
        <div class="container">
          <h2 class="section-title">为什么选择 FreeFrp？</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">
                <n-icon size="48" color="#18a058">
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.1 16,12.7V16.2C16,16.8 15.4,17.3 14.8,17.3H9.2C8.6,17.3 8,16.8 8,16.2V12.7C8,12.1 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"
                    />
                  </svg>
                </n-icon>
              </div>
              <h3>安全可靠</h3>
              <p>采用先进的加密技术，保障您的数据传输安全</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <n-icon size="48" color="#2080f0">
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z"
                    />
                  </svg>
                </n-icon>
              </div>
              <h3>简单易用</h3>
              <p>一键生成配置文件，快速部署您的内网穿透服务</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <n-icon size="48" color="#f0a020">
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"
                    />
                  </svg>
                </n-icon>
              </div>
              <h3>高速稳定</h3>
              <p>多节点部署，智能路由，确保最佳的连接速度</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <n-icon size="48" color="#d03050">
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,1H5C3.89,1 3,1.89 3,3V21A2,2 0 0,0 5,23H19A2,2 0 0,0 21,21V9M19,9H14V4H5V19L19,19V9Z"
                    />
                  </svg>
                </n-icon>
              </div>
              <h3>完全免费</h3>
              <p>提供免费的内网穿透服务，无隐藏费用</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用统计 -->
      <div class="stats-section">
        <div class="container">
          <h2 class="section-title">服务统计</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ stats.userCount }}</div>
              <div class="stat-label">注册用户</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.tunnelCount }}</div>
              <div class="stat-label">活跃隧道</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.nodeCount }}</div>
              <div class="stat-label">可用节点</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ formatTraffic(stats.totalTraffic) }}</div>
              <div class="stat-label">总流量</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <n-layout-footer class="footer">
      <div class="footer-content">
        <p>&copy; 2024 FreeFrp. All rights reserved.</p>
        <p>免费内网穿透服务 | 让连接更简单</p>
      </div>
    </n-layout-footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NLayoutHeader, NLayoutFooter, NButton, NSpace, NIcon } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import { api } from '@/api/index';

const userStore = useUserStore();

const stats = ref({
  userCount: 0,
  tunnelCount: 0,
  nodeCount: 0,
  totalTraffic: 0,
});

const formatTraffic = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const fetchStats = async () => {
  try {
    const response = await api.get('/stats');
    stats.value = response.data;
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
};

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #2080f0;
}

.main-content {
  flex: 1;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 120px 24px;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 4rem;
  font-weight: bold;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 2rem;
  font-weight: 300;
  margin: 0 0 24px 0;
  opacity: 0.9;
}

.hero-description {
  font-size: 1.2rem;
  line-height: 1.6;
  margin: 0 0 48px 0;
  opacity: 0.8;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.features-section {
  padding: 80px 24px;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0 0 64px 0;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}

.feature-card {
  background: white;
  padding: 40px 24px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  margin-bottom: 24px;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 16px 0;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.stats-section {
  padding: 80px 24px;
  background: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
}

.stat-card {
  text-align: center;
  padding: 32px 16px;
}

.stat-number {
  font-size: 3rem;
  font-weight: bold;
  color: #2080f0;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 1.1rem;
  color: #666;
  font-weight: 500;
}

.footer {
  background: #333;
  color: white;
  padding: 32px 24px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-content p {
  margin: 8px 0;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.5rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .section-title {
    font-size: 2rem;
  }
}
</style>
