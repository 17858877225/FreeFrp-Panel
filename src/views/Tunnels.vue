<template>
  <div class="tunnels">
    <div class="tunnels-header">
      <h1>隧道管理</h1>
      <n-button type="primary" @click="showCreateModal = true">
        <template #icon>
          <n-icon>
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
          </n-icon>
        </template>
        创建隧道
      </n-button>
    </div>

    <!-- 隧道列表 -->
    <div class="tunnels-grid">
      <div v-if="tunnels.length === 0" class="no-tunnels">
        <n-empty description="暂无隧道">
          <template #extra>
            <n-button size="small" @click="showCreateModal = true"> 创建第一个隧道 </n-button>
          </template>
        </n-empty>
      </div>

      <n-card v-for="tunnel in tunnels" :key="tunnel.id" class="tunnel-card" :title="tunnel.name">
        <template #header-extra>
          <n-tag :type="tunnel.status === 'online' ? 'success' : 'default'">
            {{ tunnel.status === 'online' ? '在线' : '离线' }}
          </n-tag>
        </template>

        <div class="tunnel-info">
          <div class="info-row">
            <span class="label">ID:</span>
            <span class="value"># {{ tunnel.id }}</span>
          </div>
          <div class="info-row">
            <span class="label">协议:</span>
            <span class="value">{{ tunnel.type.toUpperCase() }}</span>
          </div>
          <div class="info-row" v-if="tunnel.customDomain">
            <span class="label">绑定域名:</span>
            <span class="value">{{ tunnel.customDomain }}</span>
          </div>
          <div class="info-row">
            <span class="label">节点:</span>
            <span class="value">{{ getNodeName(tunnel.nodeId) }}</span>
          </div>
        </div>

        <template #action>
          <div class="tunnel-actions">
            <n-button size="small" @click="viewConfig(tunnel)"> 查看配置 </n-button>
            <n-button size="small" type="warning" @click="editTunnel(tunnel)"> 编辑 </n-button>
            <n-button size="small" type="error" @click="deleteTunnel(tunnel)"> 删除 </n-button>
          </div>
        </template>
      </n-card>
    </div>

    <!-- 创建隧道模态框 -->
    <n-modal v-model:show="showCreateModal" preset="dialog" title="创建隧道">
      <n-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-placement="left"
        label-width="auto"
      >
        <n-form-item label="隧道名称" path="name">
          <n-input v-model:value="createForm.name" placeholder="请输入隧道名称" />
        </n-form-item>

        <n-form-item label="选择节点" path="nodeId">
          <n-select
            v-model:value="createForm.nodeId"
            :options="nodeOptions"
            placeholder="请选择节点"
            @update:value="onNodeChange"
          />
        </n-form-item>

        <n-form-item label="协议类型" path="type">
          <n-select
            v-model:value="createForm.type"
            :options="protocolOptions"
            placeholder="请选择协议"
            @update:value="onProtocolChange"
          />
        </n-form-item>

        <n-form-item label="本地IP" path="localIp">
          <n-input v-model:value="createForm.localIp" placeholder="127.0.0.1" />
        </n-form-item>

        <n-form-item label="本地端口" path="localPort">
          <n-input-number
            v-model:value="createForm.localPort"
            :min="1"
            :max="65535"
            placeholder="请输入本地端口"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item
          v-if="createForm.type === 'tcp' || createForm.type === 'udp'"
          label="远程端口"
          path="remotePort"
        >
          <n-input-number
            v-model:value="createForm.remotePort"
            :min="1024"
            :max="65535"
            placeholder="请输入远程端口"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item
          v-if="createForm.type === 'http' || createForm.type === 'https'"
          label="自定义域名"
          path="customDomain"
        >
          <n-input v-model:value="createForm.customDomain" placeholder="example.com" />
        </n-form-item>

        <n-form-item v-if="createForm.type === 'https'" label="SSL证书路径" path="sslCert">
          <n-input v-model:value="createForm.sslCert" placeholder="/path/to/cert.pem" />
        </n-form-item>

        <n-form-item v-if="createForm.type === 'https'" label="SSL密钥路径" path="sslKey">
          <n-input v-model:value="createForm.sslKey" placeholder="/path/to/key.pem" />
        </n-form-item>
      </n-form>

      <template #action>
        <n-button @click="showCreateModal = false">取消</n-button>
        <n-button type="primary" :loading="createLoading" @click="handleCreateTunnel">
          创建
        </n-button>
      </template>
    </n-modal>

    <!-- 查看配置模态框 -->
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
import { ref, reactive, onMounted, computed } from 'vue';
import {
  NButton,
  NCard,
  NTag,
  NEmpty,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NCode,
  NIcon,
  useMessage,
  useDialog,
} from 'naive-ui';
import { api } from '@/api/index';
import { useUserStore } from '@/stores/user';

const message = useMessage();
const dialog = useDialog();
const userStore = useUserStore();

const tunnels = ref<any[]>([]);
const nodes = ref<any[]>([]);
const loading = ref(false);
const createLoading = ref(false);
const showCreateModal = ref(false);
const showConfigModal = ref(false);
const configContent = ref('');
const createFormRef = ref();

const createForm = reactive({
  name: '',
  nodeId: null,
  type: 'tcp',
  localIp: '127.0.0.1',
  localPort: null,
  remotePort: null,
  customDomain: '',
  sslCert: '',
  sslKey: '',
});

const createRules = {
  name: {
    required: true,
    message: '请输入隧道名称',
    trigger: 'blur',
  },
  nodeId: {
    required: true,
    message: '请选择节点',
    trigger: 'change',
  },
  type: {
    required: true,
    message: '请选择协议类型',
    trigger: 'change',
  },
  localIp: {
    required: true,
    message: '请输入本地IP',
    trigger: 'blur',
  },
  localPort: {
    required: true,
    message: '请输入本地端口',
    trigger: 'blur',
  },
};

const nodeOptions = computed(() => {
  return nodes.value.map((node) => ({
    label: `${node.name} (${node.location})`,
    value: node.id,
    disabled: !node.enabled,
  }));
});

const protocolOptions = [
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' },
  { label: 'HTTP', value: 'http' },
  { label: 'HTTPS', value: 'https' },
];

const getNodeName = (nodeId: number) => {
  const node = nodes.value.find((n) => n.id === nodeId);
  return node ? `${node.name} (${node.location})` : '未知节点';
};

const onNodeChange = () => {
  // 节点变更时的逻辑
};

const onProtocolChange = () => {
  // 协议变更时重置相关字段
  if (createForm.type === 'tcp' || createForm.type === 'udp') {
    createForm.customDomain = '';
    createForm.sslCert = '';
    createForm.sslKey = '';
  } else {
    createForm.remotePort = null;
  }
};

const fetchTunnels = async () => {
  try {
    loading.value = true;
    const response = await api.get('/tunnels');
    tunnels.value = response.data.data || [];
  } catch (error) {
    console.error('获取隧道列表失败:', error);
    message.error('获取隧道列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchNodes = async () => {
  try {
    const response = await api.get('/nodes');
    nodes.value = response.data.data || [];
  } catch (error) {
    console.error('获取节点列表失败:', error);
  }
};

const handleCreateTunnel = async () => {
  try {
    await createFormRef.value?.validate();
    createLoading.value = true;

    const response = await api.post('/tunnels', createForm);

    if (response.data.success) {
      message.success('隧道创建成功');
      showCreateModal.value = false;
      resetCreateForm();
      await fetchTunnels();
    } else {
      message.error(response.data.message);
    }
  } catch (error) {
    console.error('创建隧道失败:', error);
    message.error('创建隧道失败');
  } finally {
    createLoading.value = false;
  }
};

const viewConfig = async (tunnel: any) => {
  try {
    const response = await api.get(`/tunnels/${tunnel.id}/config`);
    configContent.value = response.data.data.config;
    showConfigModal.value = true;
  } catch (error) {
    console.error('获取配置失败:', error);
    message.error('获取配置失败');
  }
};

const copyConfig = async () => {
  try {
    await navigator.clipboard.writeText(configContent.value);
    message.success('配置已复制到剪贴板');
  } catch (error) {
    message.error('复制失败');
  }
};

const editTunnel = (tunnel: any) => {
  // TODO: 实现编辑功能
  message.info('编辑功能开发中');
};

const deleteTunnel = (tunnel: any) => {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除隧道 "${tunnel.name}" 吗？此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await api.delete(`/tunnels/${tunnel.id}`);
        message.success('隧道删除成功');
        await fetchTunnels();
      } catch (error) {
        console.error('删除隧道失败:', error);
        message.error('删除隧道失败');
      }
    },
  });
};

const resetCreateForm = () => {
  Object.assign(createForm, {
    name: '',
    nodeId: null,
    type: 'tcp',
    localIp: '127.0.0.1',
    localPort: null,
    remotePort: null,
    customDomain: '',
    sslCert: '',
    sslKey: '',
  });
};

onMounted(async () => {
  await Promise.all([fetchTunnels(), fetchNodes()]);
});
</script>

<style scoped>
.tunnels {
  padding: 24px;
  max-width: 1200px;
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

.tunnels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.no-tunnels {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  padding: 64px 0;
}

.tunnel-card {
  height: fit-content;
}

.tunnel-info {
  margin-bottom: 16px;
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
}

.value {
  color: #333;
  font-weight: 500;
}

.tunnel-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.config-content {
  max-height: 400px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .tunnels {
    padding: 16px;
  }

  .tunnels-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .tunnels-grid {
    grid-template-columns: 1fr;
  }

  .tunnel-actions {
    justify-content: center;
  }
}
</style>
