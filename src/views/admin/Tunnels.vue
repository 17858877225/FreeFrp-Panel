<template>
  <div class="admin-tunnels">
    <div class="tunnels-header">
      <h1>隧道管理</h1>
      <div class="header-actions">
        <n-input
          v-model:value="searchQuery"
          placeholder="搜索隧道名称或用户"
          style="width: 300px;"
          @input="handleSearch"
        >
          <template #prefix>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
              </svg>
            </n-icon>
          </template>
        </n-input>
        <n-select
          v-model:value="statusFilter"
          :options="statusOptions"
          placeholder="状态筛选"
          style="width: 150px;"
          clearable
        />
        <n-select
          v-model:value="typeFilter"
          :options="typeOptions"
          placeholder="协议筛选"
          style="width: 150px;"
          clearable
        />
        <n-button @click="refreshTunnels" :loading="loading">
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
    </div>

    <!-- 隧道统计 -->
    <div class="tunnels-stats">
      <n-card class="stat-card">
        <n-statistic label="总隧道数" :value="totalTunnels" />
      </n-card>
      <n-card class="stat-card">
        <n-statistic label="在线隧道" :value="onlineTunnels" />
      </n-card>
      <n-card class="stat-card">
        <n-statistic label="离线隧道" :value="offlineTunnels" />
      </n-card>
      <n-card class="stat-card">
        <n-statistic label="今日流量" :value="todayTraffic" suffix="GB" />
      </n-card>
    </div>

    <!-- 隧道列表 -->
    <n-card title="隧道列表" class="tunnels-table-card">
      <n-data-table
        :columns="columns"
        :data="filteredTunnels"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row: any) => row.id"
        size="small"
      />
    </n-card>

    <!-- 隧道详情模态框 -->
    <n-modal v-model:show="showTunnelModal" preset="dialog" title="隧道详情">
      <div v-if="selectedTunnel" class="tunnel-details">
        <div class="detail-section">
          <h4>基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">隧道ID:</span>
              <span class="value">{{ selectedTunnel.id }}</span>
            </div>
            <div class="detail-item">
              <span class="label">隧道名称:</span>
              <span class="value">{{ selectedTunnel.name }}</span>
            </div>
            <div class="detail-item">
              <span class="label">所属用户:</span>
              <span class="value">{{ selectedTunnel.username }}</span>
            </div>
            <div class="detail-item">
              <span class="label">协议类型:</span>
              <n-tag size="small">{{ selectedTunnel.type.toUpperCase() }}</n-tag>
            </div>
            <div class="detail-item">
              <span class="label">状态:</span>
              <n-tag :type="selectedTunnel.status === 'online' ? 'success' : 'default'" size="small">
                {{ selectedTunnel.status === 'online' ? '在线' : '离线' }}
              </n-tag>
            </div>
            <div class="detail-item">
              <span class="label">节点:</span>
              <span class="value">{{ getNodeName(selectedTunnel.nodeId) }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>连接信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">本地地址:</span>
              <span class="value">{{ selectedTunnel.localIp }}:{{ selectedTunnel.localPort }}</span>
            </div>
            <div class="detail-item" v-if="selectedTunnel.remotePort">
              <span class="label">远程端口:</span>
              <span class="value">{{ selectedTunnel.remotePort }}</span>
            </div>
            <div class="detail-item" v-if="selectedTunnel.customDomain">
              <span class="label">自定义域名:</span>
              <span class="value">{{ selectedTunnel.customDomain }}</span>
            </div>
            <div class="detail-item" v-if="selectedTunnel.sslCert">
              <span class="label">SSL证书:</span>
              <span class="value">{{ selectedTunnel.sslCert }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>流量统计</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">今日流量:</span>
              <span class="value">{{ formatBytes(selectedTunnel.todayTraffic || 0) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">本月流量:</span>
              <span class="value">{{ formatBytes(selectedTunnel.monthTraffic || 0) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">总流量:</span>
              <span class="value">{{ formatBytes(selectedTunnel.totalTraffic || 0) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">连接数:</span>
              <span class="value">{{ selectedTunnel.connections || 0 }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>时间信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">创建时间:</span>
              <span class="value">{{ formatDate(selectedTunnel.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">最后连接:</span>
              <span class="value">{{ formatDate(selectedTunnel.lastConnectedAt) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">最后更新:</span>
              <span class="value">{{ formatDate(selectedTunnel.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <template #action>
        <n-button @click="showTunnelModal = false">关闭</n-button>
      </template>
    </n-modal>

    <!-- 配置查看模态框 -->
    <n-modal v-model:show="showConfigModal" preset="dialog" title="隧道配置">
      <div class="config-content">
        <n-code :code="configContent" language="ini" show-line-numbers />
      </div>
      
      <template #action>
        <n-button @click="copyConfig">复制配置</n-button>
        <n-button type="primary" @click="showConfigModal = false">关闭</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  NCard,
  NButton,
  NIcon,
  NInput,
  NSelect,
  NStatistic,
  NDataTable,
  NTag,
  NModal,
  NCode,
  useMessage,
  useDialog
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { api } from '@/api/index'

const message = useMessage()
const dialog = useDialog()

const tunnels = ref<any[]>([])
const nodes = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref<string | null>(null)
const typeFilter = ref<string | null>(null)
const showTunnelModal = ref(false)
const showConfigModal = ref(false)
const selectedTunnel = ref<any>(null)
const configContent = ref('')

const pagination = {
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100]
}

const statusOptions = [
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' }
]

const typeOptions = [
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' },
  { label: 'HTTP', value: 'http' },
  { label: 'HTTPS', value: 'https' }
]

const filteredTunnels = computed(() => {
  let result = tunnels.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(tunnel => 
      tunnel.name.toLowerCase().includes(query) ||
      tunnel.username.toLowerCase().includes(query)
    )
  }
  
  if (statusFilter.value) {
    result = result.filter(tunnel => tunnel.status === statusFilter.value)
  }
  
  if (typeFilter.value) {
    result = result.filter(tunnel => tunnel.type === typeFilter.value)
  }
  
  return result
})

const totalTunnels = computed(() => tunnels.value.length)
const onlineTunnels = computed(() => tunnels.value.filter(t => t.status === 'online').length)
const offlineTunnels = computed(() => tunnels.value.filter(t => t.status === 'offline').length)
const todayTraffic = computed(() => {
  const total = tunnels.value.reduce((sum, tunnel) => sum + (tunnel.todayTraffic || 0), 0)
  return Math.round(total / (1024 * 1024 * 1024) * 100) / 100
})

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getNodeName = (nodeId: number) => {
  const node = nodes.value.find(n => n.id === nodeId)
  return node ? `${node.name} (${node.location})` : '未知节点'
}

const viewTunnel = (tunnel: any) => {
  selectedTunnel.value = tunnel
  showTunnelModal.value = true
}

const viewConfig = async (tunnel: any) => {
  try {
    const response = await api.get(`/admin/tunnels/${tunnel.id}/config`)
    configContent.value = response.data.data.config
    showConfigModal.value = true
  } catch (error) {
    console.error('获取配置失败:', error)
    message.error('获取配置失败')
  }
}

const copyConfig = async () => {
  try {
    await navigator.clipboard.writeText(configContent.value)
    message.success('配置已复制到剪贴板')
  } catch (error) {
    message.error('复制失败')
  }
}

const disconnectTunnel = (tunnel: any) => {
  dialog.warning({
    title: '确认下线',
    content: `确定要强制下线隧道 "${tunnel.name}" 吗？`,
    positiveText: '下线',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await api.post(`/admin/tunnels/${tunnel.id}/disconnect`)
        message.success('隧道已强制下线')
        await fetchTunnels()
      } catch (error) {
        console.error('下线隧道失败:', error)
        message.error('下线隧道失败')
      }
    }
  })
}

const deleteTunnel = (tunnel: any) => {
  dialog.error({
    title: '确认删除',
    content: `确定要删除隧道 "${tunnel.name}" 吗？此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await api.delete(`/admin/tunnels/${tunnel.id}`)
        message.success('隧道删除成功')
        await fetchTunnels()
      } catch (error) {
        console.error('删除隧道失败:', error)
        message.error('删除隧道失败')
      }
    }
  })
}

const columns: DataTableColumns<any> = [
  {
    title: 'ID',
    key: 'id',
    width: 80
  },
  {
    title: '隧道名称',
    key: 'name',
    width: 150
  },
  {
    title: '用户',
    key: 'username',
    width: 120
  },
  {
    title: '协议',
    key: 'type',
    width: 80,
    render(row) {
      return h(NTag, {
        size: 'small'
      }, { default: () => row.type.toUpperCase() })
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render(row) {
      return h(NTag, {
        type: row.status === 'online' ? 'success' : 'default',
        size: 'small'
      }, { default: () => row.status === 'online' ? '在线' : '离线' })
    }
  },
  {
    title: '节点',
    key: 'nodeId',
    width: 150,
    render(row) {
      return getNodeName(row.nodeId)
    }
  },
  {
    title: '本地地址',
    key: 'localAddress',
    width: 150,
    render(row) {
      return `${row.localIp}:${row.localPort}`
    }
  },
  {
    title: '今日流量',
    key: 'todayTraffic',
    width: 120,
    render(row) {
      return formatBytes(row.todayTraffic || 0)
    }
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 160,
    render(row) {
      return formatDate(row.createdAt)
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    render(row) {
      return h('div', { style: 'display: flex; gap: 8px; flex-wrap: wrap;' }, [
        h(NButton, {
          size: 'small',
          onClick: () => viewTunnel(row)
        }, { default: () => '详情' }),
        
        h(NButton, {
          size: 'small',
          type: 'info',
          onClick: () => viewConfig(row)
        }, { default: () => '配置' }),
        
        row.status === 'online' ? h(NButton, {
          size: 'small',
          type: 'warning',
          onClick: () => disconnectTunnel(row)
        }, { default: () => '下线' }) : null,
        
        h(NButton, {
          size: 'small',
          type: 'error',
          onClick: () => deleteTunnel(row)
        }, { default: () => '删除' })
      ].filter(Boolean))
    }
  }
]

const fetchTunnels = async () => {
  try {
    loading.value = true
    const response = await api.get('/admin/tunnels')
    tunnels.value = response.data.data || []
  } catch (error) {
    console.error('获取隧道列表失败:', error)
    message.error('获取隧道列表失败')
  } finally {
    loading.value = false
  }
}

const fetchNodes = async () => {
  try {
    const response = await api.get('/admin/nodes')
    nodes.value = response.data.data || []
  } catch (error) {
    console.error('获取节点列表失败:', error)
  }
}

const refreshTunnels = async () => {
  await fetchTunnels()
  message.success('隧道列表已刷新')
}

const handleSearch = () => {
  // 搜索逻辑已在 computed 中处理
}

onMounted(async () => {
  await Promise.all([
    fetchTunnels(),
    fetchNodes()
  ])
})
</script>

<style scoped>
.admin-tunnels {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.tunnels-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.tunnels-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.tunnels-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  text-align: center;
}

.tunnels-table-card {
  width: 100%;
}

.tunnel-details {
  max-height: 600px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-item .label {
  color: #666;
  font-weight: 500;
  min-width: 80px;
}

.detail-item .value {
  color: #333;
  font-weight: 500;
}

.config-content {
  max-height: 400px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .admin-tunnels {
    padding: 16px;
  }
  
  .tunnels-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .tunnels-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>