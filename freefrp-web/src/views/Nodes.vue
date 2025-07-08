<template>
  <div class="nodes">
    <div class="nodes-header">
      <h1>节点状态</h1>
      <n-button @click="refreshNodes" :loading="loading">
        <template #icon>
          <n-icon>
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
            </svg>
          </n-icon>
        </template>
        刷新
      </n-button>
    </div>

    <!-- 节点统计 -->
    <div class="nodes-stats">
      <n-card class="stat-card">
        <n-statistic label="总节点数" :value="nodes.length" />
      </n-card>
      <n-card class="stat-card">
        <n-statistic label="在线节点" :value="onlineNodes" />
      </n-card>
      <n-card class="stat-card">
        <n-statistic label="离线节点" :value="offlineNodes" />
      </n-card>
      <n-card class="stat-card">
        <n-statistic label="总流量" :value="totalTraffic" suffix="GB" />
      </n-card>
    </div>

    <!-- 节点列表 -->
    <div class="nodes-grid">
      <n-card
        v-for="node in nodes"
        :key="node.id"
        class="node-card"
        :title="node.name"
      >
        <template #header-extra>
          <n-tag :type="node.status === 'online' ? 'success' : 'error'">
            {{ node.status === 'online' ? '在线' : '离线' }}
          </n-tag>
        </template>
        
        <div class="node-info">
          <div class="info-section">
            <h4>基本信息</h4>
            <div class="info-row">
              <span class="label">节点ID:</span>
              <span class="value">{{ node.id }}</span>
            </div>
            <div class="info-row">
              <span class="label">地区:</span>
              <span class="value">{{ node.location }}</span>
            </div>
            <div class="info-row">
              <span class="label">服务器地址:</span>
              <span class="value">{{ node.serverAddr }}</span>
            </div>
            <div class="info-row">
              <span class="label">端口:</span>
              <span class="value">{{ node.serverPort }}</span>
            </div>
            <div class="info-row">
              <span class="label">状态:</span>
              <n-tag :type="node.enabled ? 'success' : 'warning'" size="small">
                {{ node.enabled ? '启用' : '禁用' }}
              </n-tag>
            </div>
          </div>
          
          <div class="info-section" v-if="node.status === 'online'">
            <h4>性能指标</h4>
            <div class="info-row">
              <span class="label">CPU使用率:</span>
              <span class="value">
                <n-progress
                  type="line"
                  :percentage="node.cpuUsage || 0"
                  :show-indicator="false"
                  style="width: 60px; margin-right: 8px;"
                />
                {{ node.cpuUsage || 0 }}%
              </span>
            </div>
            <div class="info-row">
              <span class="label">内存使用率:</span>
              <span class="value">
                <n-progress
                  type="line"
                  :percentage="node.memoryUsage || 0"
                  :show-indicator="false"
                  style="width: 60px; margin-right: 8px;"
                />
                {{ node.memoryUsage || 0 }}%
              </span>
            </div>
            <div class="info-row">
              <span class="label">活跃连接:</span>
              <span class="value">{{ node.activeConnections || 0 }}</span>
            </div>
            <div class="info-row">
              <span class="label">延迟:</span>
              <span class="value">{{ node.latency || 0 }}ms</span>
            </div>
          </div>
          
          <div class="info-section">
            <h4>流量统计</h4>
            <div class="info-row">
              <span class="label">今日流量:</span>
              <span class="value">{{ formatBytes(node.todayTraffic || 0) }}</span>
            </div>
            <div class="info-row">
              <span class="label">本月流量:</span>
              <span class="value">{{ formatBytes(node.monthTraffic || 0) }}</span>
            </div>
            <div class="info-row">
              <span class="label">总流量:</span>
              <span class="value">{{ formatBytes(node.totalTraffic || 0) }}</span>
            </div>
            <div class="info-row">
              <span class="label">上行速度:</span>
              <span class="value">{{ formatSpeed(node.uploadSpeed || 0) }}</span>
            </div>
            <div class="info-row">
              <span class="label">下行速度:</span>
              <span class="value">{{ formatSpeed(node.downloadSpeed || 0) }}</span>
            </div>
          </div>
          
          <div class="info-section">
            <h4>其他信息</h4>
            <div class="info-row">
              <span class="label">最大带宽:</span>
              <span class="value">{{ node.maxBandwidth || 'N/A' }}</span>
            </div>
            <div class="info-row">
              <span class="label">支持协议:</span>
              <span class="value">
                <n-tag
                  v-for="protocol in node.supportedProtocols || ['TCP', 'UDP', 'HTTP', 'HTTPS']"
                  :key="protocol"
                  size="small"
                  style="margin-right: 4px;"
                >
                  {{ protocol }}
                </n-tag>
              </span>
            </div>
            <div class="info-row">
              <span class="label">最后更新:</span>
              <span class="value">{{ formatDate(node.lastUpdate) }}</span>
            </div>
          </div>
        </div>
      </n-card>
    </div>
    
    <div v-if="nodes.length === 0" class="no-nodes">
      <n-empty description="暂无节点数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  NCard,
  NTag,
  NButton,
  NIcon,
  NStatistic,
  NProgress,
  NEmpty,
  useMessage
} from 'naive-ui'
import { api } from '@/api/index'

const message = useMessage()

const nodes = ref<any[]>([])
const loading = ref(false)
let refreshTimer: NodeJS.Timeout | null = null

const onlineNodes = computed(() => {
  return nodes.value.filter(node => node.status === 'online').length
})

const offlineNodes = computed(() => {
  return nodes.value.filter(node => node.status === 'offline').length
})

const totalTraffic = computed(() => {
  const total = nodes.value.reduce((sum, node) => sum + (node.totalTraffic || 0), 0)
  return Math.round(total / (1024 * 1024 * 1024) * 100) / 100 // 转换为GB并保留2位小数
})

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatSpeed = (bytesPerSecond: number) => {
  if (bytesPerSecond === 0) return '0 B/s'
  const k = 1024
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k))
  return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('zh-CN')
}

const fetchNodes = async () => {
  try {
    loading.value = true
    const response = await api.get('/nodes/status')
    nodes.value = response.data.data || []
  } catch (error) {
    console.error('获取节点状态失败:', error)
    message.error('获取节点状态失败')
  } finally {
    loading.value = false
  }
}

const refreshNodes = async () => {
  await fetchNodes()
  message.success('节点状态已刷新')
}

const startAutoRefresh = () => {
  // 每30秒自动刷新一次
  refreshTimer = setInterval(() => {
    fetchNodes()
  }, 30000)
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

onMounted(async () => {
  await fetchNodes()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.nodes {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.nodes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.nodes-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.nodes-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  text-align: center;
}

.nodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.node-card {
  height: fit-content;
}

.node-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-section {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.info-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-section h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #666;
  font-weight: 500;
  min-width: 80px;
}

.value {
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
}

.no-nodes {
  display: flex;
  justify-content: center;
  padding: 64px 0;
}

@media (max-width: 768px) {
  .nodes {
    padding: 16px;
  }
  
  .nodes-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .nodes-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .nodes-grid {
    grid-template-columns: 1fr;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .value {
    justify-content: flex-start;
  }
}
</style>