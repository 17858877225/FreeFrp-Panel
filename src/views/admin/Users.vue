<template>
  <div class="admin-users">
    <div class="users-header">
      <h1>用户管理</h1>
      <div class="header-actions">
        <n-input
          v-model:value="searchQuery"
          placeholder="搜索用户名或邮箱"
          style="width: 300px"
          @input="handleSearch"
        >
          <template #prefix>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
                />
              </svg>
            </n-icon>
          </template>
        </n-input>
        <n-button @click="refreshUsers" :loading="loading">
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

    <!-- 用户统计 -->
    <div class="users-stats">
      <n-card class="stat-card">
        <n-statistic label="总用户数" :value="totalUsers" />
      </n-card>
      <n-card class="stat-card">
        <n-statistic label="活跃用户" :value="activeUsers" />
      </n-card>
      <n-card class="stat-card">
        <n-statistic label="已认证用户" :value="verifiedUsers" />
      </n-card>
      <n-card class="stat-card">
        <n-statistic label="被封禁用户" :value="bannedUsers" />
      </n-card>
    </div>

    <!-- 用户列表 -->
    <n-card title="用户列表" class="users-table-card">
      <n-data-table
        :columns="columns"
        :data="filteredUsers"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row: any) => row.id"
        size="small"
      />
    </n-card>

    <!-- 用户详情模态框 -->
    <n-modal v-model:show="showUserModal" preset="dialog" title="用户详情">
      <div v-if="selectedUser" class="user-details">
        <div class="detail-section">
          <h4>基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">用户ID:</span>
              <span class="value">{{ selectedUser.id }}</span>
            </div>
            <div class="detail-item">
              <span class="label">用户名:</span>
              <span class="value">{{ selectedUser.username }}</span>
            </div>
            <div class="detail-item">
              <span class="label">邮箱:</span>
              <span class="value">{{ selectedUser.email }}</span>
            </div>
            <div class="detail-item">
              <span class="label">用户组:</span>
              <n-tag :type="getUserGroupType(selectedUser.userGroup)">
                {{ getUserGroupText(selectedUser.userGroup) }}
              </n-tag>
            </div>
            <div class="detail-item">
              <span class="label">状态:</span>
              <n-tag :type="selectedUser.status === 'active' ? 'success' : 'error'">
                {{ selectedUser.status === 'active' ? '正常' : '封禁' }}
              </n-tag>
            </div>
            <div class="detail-item">
              <span class="label">注册时间:</span>
              <span class="value">{{ formatDate(selectedUser.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="selectedUser.realName">
          <h4>实名信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">真实姓名:</span>
              <span class="value">{{ selectedUser.realName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">身份证号:</span>
              <span class="value">{{ maskIdCard(selectedUser.idCard) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">认证状态:</span>
              <n-tag :type="selectedUser.realNameStatus === 'verified' ? 'success' : 'warning'">
                {{ getRealNameStatusText(selectedUser.realNameStatus) }}
              </n-tag>
            </div>
            <div class="detail-item">
              <span class="label">认证时间:</span>
              <span class="value">{{ formatDate(selectedUser.verifiedAt) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>使用统计</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">隧道数量:</span>
              <span class="value">{{ selectedUser.tunnelCount || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="label">剩余流量:</span>
              <span class="value">{{ formatBytes(selectedUser.remainingTraffic || 0) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">总使用流量:</span>
              <span class="value">{{ formatBytes(selectedUser.totalTraffic || 0) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">连续签到:</span>
              <span class="value">{{ selectedUser.consecutiveCheckinDays || 0 }} 天</span>
            </div>
            <div class="detail-item">
              <span class="label">最后登录:</span>
              <span class="value">{{ formatDate(selectedUser.lastLoginAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #action>
        <n-button @click="showUserModal = false">关闭</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import {
  NCard,
  NButton,
  NIcon,
  NInput,
  NStatistic,
  NDataTable,
  NTag,
  NModal,
  useMessage,
  useDialog,
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { api } from '@/api/index';

const message = useMessage();
const dialog = useDialog();

const users = ref<any[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const showUserModal = ref(false);
const selectedUser = ref<any>(null);

const pagination = {
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
};

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(
    (user) =>
      user.username.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
  );
});

const totalUsers = computed(() => users.value.length);
const activeUsers = computed(() => users.value.filter((u) => u.status === 'active').length);
const verifiedUsers = computed(
  () => users.value.filter((u) => u.realNameStatus === 'verified').length,
);
const bannedUsers = computed(() => users.value.filter((u) => u.status === 'banned').length);

const getUserGroupText = (group?: string) => {
  switch (group) {
    case 'unverified':
      return '未实名认证';
    case 'verified':
      return '正式用户';
    case 'sponsor':
      return '赞助者';
    case 'admin':
      return '管理员';
    default:
      return '未知';
  }
};

const getUserGroupType = (group?: string) => {
  switch (group) {
    case 'unverified':
      return 'warning';
    case 'verified':
      return 'info';
    case 'sponsor':
      return 'success';
    case 'admin':
      return 'error';
    default:
      return 'default';
  }
};

const getRealNameStatusText = (status?: string) => {
  switch (status) {
    case 'verified':
      return '已认证';
    case 'pending':
      return '审核中';
    case 'rejected':
      return '已拒绝';
    default:
      return '未认证';
  }
};

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

const maskIdCard = (idCard?: string) => {
  if (!idCard) return 'N/A';
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
};

const viewUser = (user: any) => {
  selectedUser.value = user;
  showUserModal.value = true;
};

const banUser = (user: any) => {
  dialog.warning({
    title: '确认封禁',
    content: `确定要封禁用户 "${user.username}" 吗？`,
    positiveText: '封禁',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await api.post(`/admin/users/${user.id}/ban`);
        message.success('用户封禁成功');
        await fetchUsers();
      } catch (error) {
        console.error('封禁用户失败:', error);
        message.error('封禁用户失败');
      }
    },
  });
};

const unbanUser = (user: any) => {
  dialog.info({
    title: '确认解封',
    content: `确定要解封用户 "${user.username}" 吗？`,
    positiveText: '解封',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await api.post(`/admin/users/${user.id}/unban`);
        message.success('用户解封成功');
        await fetchUsers();
      } catch (error) {
        console.error('解封用户失败:', error);
        message.error('解封用户失败');
      }
    },
  });
};

const changeUserGroup = (user: any, newGroup: string) => {
  dialog.info({
    title: '确认修改',
    content: `确定要将用户 "${user.username}" 的用户组修改为 "${getUserGroupText(newGroup)}" 吗？`,
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await api.put(`/admin/users/${user.id}/group`, { userGroup: newGroup });
        message.success('用户组修改成功');
        await fetchUsers();
      } catch (error) {
        console.error('修改用户组失败:', error);
        message.error('修改用户组失败');
      }
    },
  });
};

const columns: DataTableColumns<any> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '用户名',
    key: 'username',
    width: 120,
  },
  {
    title: '邮箱',
    key: 'email',
    width: 200,
  },
  {
    title: '用户组',
    key: 'userGroup',
    width: 120,
    render(row) {
      return h(
        NTag,
        {
          type: getUserGroupType(row.userGroup),
          size: 'small',
        },
        { default: () => getUserGroupText(row.userGroup) },
      );
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
          type: row.status === 'active' ? 'success' : 'error',
          size: 'small',
        },
        { default: () => (row.status === 'active' ? '正常' : '封禁') },
      );
    },
  },
  {
    title: '隧道数',
    key: 'tunnelCount',
    width: 80,
    render(row) {
      return row.tunnelCount || 0;
    },
  },
  {
    title: '注册时间',
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
            onClick: () => viewUser(row),
          },
          { default: () => '详情' },
        ),

        row.status === 'active'
          ? h(
              NButton,
              {
                size: 'small',
                type: 'warning',
                onClick: () => banUser(row),
              },
              { default: () => '封禁' },
            )
          : h(
              NButton,
              {
                size: 'small',
                type: 'info',
                onClick: () => unbanUser(row),
              },
              { default: () => '解封' },
            ),

        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => {
              // 简单的用户组切换逻辑
              const groups = ['unverified', 'verified', 'sponsor', 'admin'];
              const currentIndex = groups.indexOf(row.userGroup);
              const nextGroup = groups[(currentIndex + 1) % groups.length];
              changeUserGroup(row, nextGroup);
            },
          },
          { default: () => '改组' },
        ),
      ]);
    },
  },
];

const fetchUsers = async () => {
  try {
    loading.value = true;
    const response = await api.get('/admin/users');
    users.value = response.data.data || [];
  } catch (error) {
    console.error('获取用户列表失败:', error);
    message.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

const refreshUsers = async () => {
  await fetchUsers();
  message.success('用户列表已刷新');
};

const handleSearch = () => {
  // 搜索逻辑已在 computed 中处理
};

onMounted(async () => {
  await fetchUsers();
});
</script>

<style scoped>
.admin-users {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.users-header h1 {
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

.users-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  text-align: center;
}

.users-table-card {
  width: 100%;
}

.user-details {
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
  .admin-users {
    padding: 16px;
  }

  .users-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .users-stats {
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
