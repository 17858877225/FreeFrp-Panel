<template>
  <div class="admin-nodes">
    <div class="nodes-header">
      <h1>节点管理</h1>
      <div class="header-actions">
        <n-button type="primary" @click="showAddModal = true">
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
            </n-icon>
          </template>
          添加节点
        </n-button>
        <n-button @click="refreshNodes" :loading="loading">
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"
                />
              </svg>
            </n-icon>
          </template>
          刷新
        </n-button>
      </div>
    </div>

    <!-- 节点统计 -->
    <div class="nodes-stats">
      <n-card class="stat-card">
        <n-statistic label="总节点数" :value="totalNodes" />
      </n-card>
      <n-card class="stat-card">
        <n-statistic label="在线节点" :value="onlineNodes" />
      </n-card>
      <n-card class="stat-card">
        <n-statistic label="启用节点" :value="enabledNodes" />
      </n-card>
      <n-card class="stat-card">
        <n-statistic label="总流量" :value="totalTraffic" suffix="TB" />
      </n-card>
    </div>

    <!-- 节点列表 -->
    <n-card title="节点列表" class="nodes-table-card">
      <n-data-table
        :columns="columns"
        :data="nodes"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row: any) => row.id"
        size="small"
      />
    </n-card>

    <!-- 添加节点模态框 -->
    <n-modal v-model:show="showAddModal" preset="dialog" title="添加节点">
      <n-form
        ref="addFormRef"
        :model="addForm"
        :rules="addRules"
        label-placement="left"
        label-width="auto"
      >
        <n-form-item label="节点名称" path="name">
          <n-input v-model:value="addForm.name" placeholder="请输入节点名称" />
        </n-form-item>

        <n-form-item label="地区" path="location">
          <n-input v-model:value="addForm.location" placeholder="请输入地区，如：北京" />
        </n-form-item>

        <n-form-item label="服务器地址" path="serverAddr">
          <n-input v-model:value="addForm.serverAddr" placeholder="请输入服务器IP或域名" />
        </n-form-item>

        <n-form-item label="服务器端口" path="serverPort">
          <n-input-number
            v-model:value="addForm.serverPort"
            :min="1"
            :max="65535"
            placeholder="请输入端口号"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item label="最大带宽" path="maxBandwidth">
          <n-input v-model:value="addForm.maxBandwidth" placeholder="如：1000 Mbps" />
        </n-form-item>

        <n-form-item label="支持协议" path="supportedProtocols">
          <n-checkbox-group v-model:value="addForm.supportedProtocols">
            <n-space>
              <n-checkbox value="TCP">TCP</n-checkbox>
              <n-checkbox value="UDP">UDP</n-checkbox>
              <n-checkbox value="HTTP">HTTP</n-checkbox>
              <n-checkbox value="HTTPS">HTTPS</n-checkbox>
            </n-space>
          </n-checkbox-group>
        </n-form-item>

        <n-form-item label="描述" path="description">
          <n-input
            v-model:value="addForm.description"
            type="textarea"
            placeholder="请输入节点描述（可选）"
            :rows="3"
          />
        </n-form-item>

        <n-form-item label="启用状态">
          <n-switch v-model:value="addForm.enabled" />
        </n-form-item>
      </n-form>

      <template #action>
        <n-button @click="showAddModal = false">取消</n-button>
        <n-button type="primary" :loading="addLoading" @click="handleAddNode"> 添加 </n-button>
      </template>
    </n-modal>

    <!-- 编辑节点模态框 -->
    <n-modal v-model:show="showEditModal" preset="dialog" title="编辑节点">
      <n-form
        ref="editFormRef"
        :model="editForm"
        :rules="addRules"
        label-placement="left"
        label-width="auto"
      >
        <n-form-item label="节点名称" path="name">
          <n-input v-model:value="editForm.name" placeholder="请输入节点名称" />
        </n-form-item>

        <n-form-item label="地区" path="location">
          <n-input v-model:value="editForm.location" placeholder="请输入地区，如：北京" />
        </n-form-item>

        <n-form-item label="服务器地址" path="serverAddr">
          <n-input v-model:value="editForm.serverAddr" placeholder="请输入服务器IP或域名" />
        </n-form-item>

        <n-form-item label="服务器端口" path="serverPort">
          <n-input-number
            v-model:value="editForm.serverPort"
            :min="1"
            :max="65535"
            placeholder="请输入端口号"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item label="最大带宽" path="maxBandwidth">
          <n-input v-model:value="editForm.maxBandwidth" placeholder="如：1000 Mbps" />
        </n-form-item>

        <n-form-item label="支持协议" path="supportedProtocols">
          <n-checkbox-group v-model:value="editForm.supportedProtocols">
            <n-space>
              <n-checkbox value="TCP">TCP</n-checkbox>
              <n-checkbox value="UDP">UDP</n-checkbox>
              <n-checkbox value="HTTP">HTTP</n-checkbox>
              <n-checkbox value="HTTPS">HTTPS</n-checkbox>
            </n-space>
          </n-checkbox-group>
        </n-form-item>

        <n-form-item label="描述" path="description">
          <n-input
            v-model:value="editForm.description"
            type="textarea"
            placeholder="请输入节点描述（可选）"
            :rows="3"
          />
        </n-form-item>

        <n-form-item label="启用状态">
          <n-switch v-model:value="editForm.enabled" />
        </n-form-item>
      </n-form>

      <template #action>
        <n-button @click="showEditModal = false">取消</n-button>
        <n-button type="primary" :loading="editLoading" @click="handleEditNode"> 保存 </n-button>
      </template>
    </n-modal>

    <!-- 节点详情模态框 -->
    <n-modal v-model:show="showDetailModal" preset="dialog" title="节点详情">
      <div v-if="selectedNode" class="node-details">
        <div class="detail-section">
          <h4>基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">节点ID:</span>
              <span class="value">{{ selectedNode.id }}</span>
            </div>
            <div class="detail-item">
              <span class="label">节点名称:</span>
              <span class="value">{{ selectedNode.name }}</span>
            </div>
            <div class="detail-item">
              <span class="label">地区:</span>
              <span class="value">{{ selectedNode.location }}</span>
            </div>
            <div class="detail-item">
              <span class="label">服务器地址:</span>
              <span class="value">{{ selectedNode.serverAddr }}:{{ selectedNode.serverPort }}</span>
            </div>
            <div class="detail-item">
              <span class="label">状态:</span>
              <n-tag :type="selectedNode.status === 'online' ? 'success' : 'error'" size="small">
                {{ selectedNode.status === 'online' ? '在线' : '离线' }}
              </n-tag>
            </div>
            <div class="detail-item">
              <span class="label">启用状态:</span>
              <n-tag :type="selectedNode.enabled ? 'success' : 'warning'" size="small">
                {{ selectedNode.enabled ? '启用' : '禁用' }}
              </n-tag>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>性能指标</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">CPU使用率:</span>
              <span class="value">{{ selectedNode.cpuUsage || 0 }}%</span>
            </div>
            <div class="detail-item">
              <span class="label">内存使用率:</span>
              <span class="value">{{ selectedNode.memoryUsage || 0 }}%</span>
            </div>
            <div class="detail-item">
              <span class="label">活跃连接:</span>
              <span class="value">{{ selectedNode.activeConnections || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="label">延迟:</span>
              <span class="value">{{ selectedNode.latency || 0 }}ms</span>
            </div>
            <div class="detail-item">
              <span class="label">最大带宽:</span>
              <span class="value">{{ selectedNode.maxBandwidth || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>流量统计</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">今日流量:</span>
              <span class="value">{{ formatBytes(selectedNode.todayTraffic || 0) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">本月流量:</span>
              <span class="value">{{ formatBytes(selectedNode.monthTraffic || 0) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">总流量:</span>
              <span class="value">{{ formatBytes(selectedNode.totalTraffic || 0) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">上行速度:</span>
              <span class="value">{{ formatSpeed(selectedNode.uploadSpeed || 0) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">下行速度:</span>
              <span class="value">{{ formatSpeed(selectedNode.downloadSpeed || 0) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>其他信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">支持协议:</span>
              <span class="value">
                <n-tag
                  v-for="protocol in selectedNode.supportedProtocols || [
                    'TCP',
                    'UDP',
                    'HTTP',
                    'HTTPS',
                  ]"
                  :key="protocol"
                  size="small"
                  style="margin-right: 4px"
                >
                  {{ protocol }}
                </n-tag>
              </span>
            </div>
            <div class="detail-item">
              <span class="label">描述:</span>
              <span class="value">{{ selectedNode.description || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">创建时间:</span>
              <span class="value">{{ formatDate(selectedNode.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">最后更新:</span>
              <span class="value">{{ formatDate(selectedNode.lastUpdate) }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #action>
        <n-button @click="showDetailModal = false">关闭</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue';
import {
  NCard,
  NButton,
  NIcon,
  NStatistic,
  NDataTable,
  NTag,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NCheckboxGroup,
  NCheckbox,
  NSwitch,
  NSpace,
  useMessage,
  useDialog,
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { api } from '@/api/index';

const message = useMessage();
const dialog = useDialog();

const nodes = ref<any[]>([]);
const loading = ref(false);
const addLoading = ref(false);
const editLoading = ref(false);
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDetailModal = ref(false);
const selectedNode = ref<any>(null);
const addFormRef = ref();
const editFormRef = ref();

const pagination = {
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
};

const addForm = reactive({
  name: '',
  location: '',
  serverAddr: '',
  serverPort: 7000,
  maxBandwidth: '',
  supportedProtocols: ['TCP', 'UDP', 'HTTP', 'HTTPS'],
  description: '',
  enabled: true,
});

const editForm = reactive({
  id: 0,
  name: '',
  location: '',
  serverAddr: '',
  serverPort: 7000,
  maxBandwidth: '',
  supportedProtocols: ['TCP', 'UDP', 'HTTP', 'HTTPS'],
  description: '',
  enabled: true,
});

const addRules = {
  name: {
    required: true,
    message: '请输入节点名称',
    trigger: 'blur',
  },
  location: {
    required: true,
    message: '请输入地区',
    trigger: 'blur',
  },
  serverAddr: {
    required: true,
    message: '请输入服务器地址',
    trigger: 'blur',
  },
  serverPort: {
    required: true,
    message: '请输入服务器端口',
    trigger: 'blur',
  },
};

const totalNodes = computed(() => nodes.value.length);
const onlineNodes = computed(() => nodes.value.filter((n) => n.status === 'online').length);
const enabledNodes = computed(() => nodes.value.filter((n) => n.enabled).length);
const totalTraffic = computed(() => {
  const total = nodes.value.reduce((sum, node) => sum + (node.totalTraffic || 0), 0);
  return Math.round((total / (1024 * 1024 * 1024 * 1024)) * 100) / 100; // 转换为TB
});

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('zh-CN');
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatSpeed = (bytesPerSecond: number) => {
  if (bytesPerSecond === 0) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const viewNode = (node: any) => {
  selectedNode.value = node;
  showDetailModal.value = true;
};

const editNode = (node: any) => {
  Object.assign(editForm, {
    id: node.id,
    name: node.name,
    location: node.location,
    serverAddr: node.serverAddr,
    serverPort: node.serverPort,
    maxBandwidth: node.maxBandwidth || '',
    supportedProtocols: node.supportedProtocols || ['TCP', 'UDP', 'HTTP', 'HTTPS'],
    description: node.description || '',
    enabled: node.enabled,
  });
  showEditModal.value = true;
};

const toggleNode = async (node: any) => {
  const action = node.enabled ? '禁用' : '启用';
  dialog.info({
    title: `确认${action}`,
    content: `确定要${action}节点 "${node.name}" 吗？`,
    positiveText: action,
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await api.put(`/admin/nodes/${node.id}/toggle`);
        message.success(`节点${action}成功`);
        await fetchNodes();
      } catch (error) {
        console.error(`${action}节点失败:`, error);
        message.error(`${action}节点失败`);
      }
    },
  });
};

const deleteNode = (node: any) => {
  dialog.error({
    title: '确认删除',
    content: `确定要删除节点 "${node.name}" 吗？此操作不可恢复，将影响该节点上的所有隧道。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await api.delete(`/admin/nodes/${node.id}`);
        message.success('节点删除成功');
        await fetchNodes();
      } catch (error) {
        console.error('删除节点失败:', error);
        message.error('删除节点失败');
      }
    },
  });
};

const handleAddNode = async () => {
  try {
    await addFormRef.value?.validate();
    addLoading.value = true;

    const response = await api.post('/admin/nodes', addForm);

    if (response.data.success) {
      message.success('节点添加成功');
      showAddModal.value = false;
      resetAddForm();
      await fetchNodes();
    } else {
      message.error(response.data.message);
    }
  } catch (error) {
    console.error('添加节点失败:', error);
    message.error('添加节点失败');
  } finally {
    addLoading.value = false;
  }
};

const handleEditNode = async () => {
  try {
    await editFormRef.value?.validate();
    editLoading.value = true;

    const response = await api.put(`/admin/nodes/${editForm.id}`, editForm);

    if (response.data.success) {
      message.success('节点更新成功');
      showEditModal.value = false;
      await fetchNodes();
    } else {
      message.error(response.data.message);
    }
  } catch (error) {
    console.error('更新节点失败:', error);
    message.error('更新节点失败');
  } finally {
    editLoading.value = false;
  }
};

const resetAddForm = () => {
  Object.assign(addForm, {
    name: '',
    location: '',
    serverAddr: '',
    serverPort: 7000,
    maxBandwidth: '',
    supportedProtocols: ['TCP', 'UDP', 'HTTP', 'HTTPS'],
    description: '',
    enabled: true,
  });
};

const columns: DataTableColumns<any> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '节点名称',
    key: 'name',
    width: 150,
  },
  {
    title: '地区',
    key: 'location',
    width: 120,
  },
  {
    title: '服务器地址',
    key: 'serverAddr',
    width: 180,
    render(row) {
      return `${row.serverAddr}:${row.serverPort}`;
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render(row) {
      return h(
        NTag,
        {
          type: row.status === 'online' ? 'success' : 'error',
          size: 'small',
        },
        { default: () => (row.status === 'online' ? '在线' : '离线') },
      );
    },
  },
  {
    title: '启用状态',
    key: 'enabled',
    width: 100,
    render(row) {
      return h(
        NTag,
        {
          type: row.enabled ? 'success' : 'warning',
          size: 'small',
        },
        { default: () => (row.enabled ? '启用' : '禁用') },
      );
    },
  },
  {
    title: '连接数',
    key: 'activeConnections',
    width: 80,
    render(row) {
      return row.activeConnections || 0;
    },
  },
  {
    title: '今日流量',
    key: 'todayTraffic',
    width: 120,
    render(row) {
      return formatBytes(row.todayTraffic || 0);
    },
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 160,
    render(row) {
      return formatDate(row.createdAt);
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render(row) {
      return h('div', { style: 'display: flex; gap: 8px; flex-wrap: wrap;' }, [
        h(
          NButton,
          {
            size: 'small',
            onClick: () => viewNode(row),
          },
          { default: () => '详情' },
        ),

        h(
          NButton,
          {
            size: 'small',
            type: 'info',
            onClick: () => editNode(row),
          },
          { default: () => '编辑' },
        ),

        h(
          NButton,
          {
            size: 'small',
            type: row.enabled ? 'warning' : 'success',
            onClick: () => toggleNode(row),
          },
          { default: () => (row.enabled ? '禁用' : '启用') },
        ),

        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            onClick: () => deleteNode(row),
          },
          { default: () => '删除' },
        ),
      ]);
    },
  },
];

const fetchNodes = async () => {
  try {
    loading.value = true;
    const response = await api.get('/admin/nodes');
    nodes.value = response.data.data || [];
  } catch (error) {
    console.error('获取节点列表失败:', error);
    message.error('获取节点列表失败');
  } finally {
    loading.value = false;
  }
};

const refreshNodes = async () => {
  await fetchNodes();
  message.success('节点列表已刷新');
};

onMounted(async () => {
  await fetchNodes();
});
</script>

<style scoped>
.admin-nodes {
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

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
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

.nodes-table-card {
  width: 100%;
}

.node-details {
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

@media (max-width: 768px) {
  .admin-nodes {
    padding: 16px;
  }

  .nodes-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .nodes-stats {
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
