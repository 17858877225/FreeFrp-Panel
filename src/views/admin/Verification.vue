<template>
  <div class="admin-verification">
    <div class="verification-header">
      <h1>实名认证管理</h1>
      <div class="header-actions">
        <n-input
          v-model:value="searchQuery"
          placeholder="搜索用户名或姓名"
          clearable
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

        <n-select
          v-model:value="statusFilter"
          placeholder="筛选状态"
          style="width: 150px"
          @update:value="handleFilter"
        >
          <n-option value="" label="全部状态" />
          <n-option value="pending" label="待审核" />
          <n-option value="approved" label="已通过" />
          <n-option value="rejected" label="已拒绝" />
        </n-select>

        <n-button @click="refreshVerifications" :loading="loading">
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

    <!-- 认证统计 -->
    <div class="verification-stats">
      <n-card class="stat-card">
        <n-statistic label="总申请数" :value="totalVerifications" />
      </n-card>
      <n-card class="stat-card">
        <n-statistic label="待审核" :value="pendingVerifications" />
      </n-card>
      <n-card class="stat-card">
        <n-statistic label="已通过" :value="approvedVerifications" />
      </n-card>
      <n-card class="stat-card">
        <n-statistic label="已拒绝" :value="rejectedVerifications" />
      </n-card>
    </div>

    <!-- 认证列表 -->
    <n-card title="实名认证列表" class="verification-table-card">
      <n-data-table
        :columns="columns"
        :data="filteredVerifications"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row: any) => row.id"
        size="small"
      />
    </n-card>

    <!-- 认证详情模态框 -->
    <n-modal
      v-model:show="showDetailModal"
      preset="dialog"
      title="实名认证详情"
      style="width: 800px"
    >
      <div v-if="selectedVerification" class="verification-details">
        <div class="detail-section">
          <h4>用户信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">用户ID:</span>
              <span class="value">{{ selectedVerification.userId }}</span>
            </div>
            <div class="detail-item">
              <span class="label">用户名:</span>
              <span class="value">{{ selectedVerification.username }}</span>
            </div>
            <div class="detail-item">
              <span class="label">邮箱:</span>
              <span class="value">{{ selectedVerification.email }}</span>
            </div>
            <div class="detail-item">
              <span class="label">申请时间:</span>
              <span class="value">{{ formatDate(selectedVerification.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>认证信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">真实姓名:</span>
              <span class="value">{{ selectedVerification.realName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">身份证号:</span>
              <span class="value">{{ selectedVerification.idCard }}</span>
            </div>
            <div class="detail-item">
              <span class="label">手机号码:</span>
              <span class="value">{{ selectedVerification.phone }}</span>
            </div>
            <div class="detail-item">
              <span class="label">认证状态:</span>
              <n-tag :type="getStatusType(selectedVerification.status)" size="small">
                {{ getStatusText(selectedVerification.status) }}
              </n-tag>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="selectedVerification.status === 'rejected'">
          <h4>拒绝原因</h4>
          <div class="rejection-reason">
            {{ selectedVerification.rejectionReason || '无' }}
          </div>
        </div>

        <div class="detail-section" v-if="selectedVerification.status === 'approved'">
          <h4>审核信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">审核员:</span>
              <span class="value">{{ selectedVerification.reviewedBy || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">审核时间:</span>
              <span class="value">{{ formatDate(selectedVerification.reviewedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 审核操作 -->
        <div class="detail-section" v-if="selectedVerification.status === 'pending'">
          <h4>审核操作</h4>
          <div class="review-actions">
            <n-space vertical>
              <n-input
                v-model:value="rejectionReason"
                type="textarea"
                placeholder="拒绝原因（可选）"
                :rows="3"
                style="margin-bottom: 16px"
              />
              <n-space>
                <n-button type="success" :loading="approveLoading" @click="handleApprove">
                  通过认证
                </n-button>
                <n-button type="error" :loading="rejectLoading" @click="handleReject">
                  拒绝认证
                </n-button>
              </n-space>
            </n-space>
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
  NInput,
  NSelect,
  NOption,
  NSpace,
  useMessage,
  useDialog,
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { api } from '@/api/index';

const message = useMessage();
const dialog = useDialog();

const verifications = ref<any[]>([]);
const loading = ref(false);
const approveLoading = ref(false);
const rejectLoading = ref(false);
const showDetailModal = ref(false);
const selectedVerification = ref<any>(null);
const searchQuery = ref('');
const statusFilter = ref('');
const rejectionReason = ref('');

const pagination = {
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
};

const totalVerifications = computed(() => verifications.value.length);
const pendingVerifications = computed(
  () => verifications.value.filter((v) => v.status === 'pending').length,
);
const approvedVerifications = computed(
  () => verifications.value.filter((v) => v.status === 'approved').length,
);
const rejectedVerifications = computed(
  () => verifications.value.filter((v) => v.status === 'rejected').length,
);

const filteredVerifications = computed(() => {
  let filtered = verifications.value;

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (v) => v.username?.toLowerCase().includes(query) || v.realName?.toLowerCase().includes(query),
    );
  }

  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter((v) => v.status === statusFilter.value);
  }

  return filtered;
});

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('zh-CN');
};

const getStatusType = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '待审核';
    case 'approved':
      return '已通过';
    case 'rejected':
      return '已拒绝';
    default:
      return '未知';
  }
};

const viewVerification = (verification: any) => {
  selectedVerification.value = verification;
  rejectionReason.value = verification.rejectionReason || '';
  showDetailModal.value = true;
};

const handleApprove = async () => {
  if (!selectedVerification.value) return;

  dialog.info({
    title: '确认通过',
    content: `确定要通过用户 "${selectedVerification.value.username}" 的实名认证吗？`,
    positiveText: '通过',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        approveLoading.value = true;
        const response = await api.post(
          `/admin/verifications/${selectedVerification.value.id}/approve`,
        );

        if (response.data.success) {
          message.success('认证审核通过');
          showDetailModal.value = false;
          await fetchVerifications();
        } else {
          message.error(response.data.message);
        }
      } catch (error) {
        console.error('审核失败:', error);
        message.error('审核失败');
      } finally {
        approveLoading.value = false;
      }
    },
  });
};

const handleReject = async () => {
  if (!selectedVerification.value) return;

  dialog.warning({
    title: '确认拒绝',
    content: `确定要拒绝用户 "${selectedVerification.value.username}" 的实名认证吗？`,
    positiveText: '拒绝',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        rejectLoading.value = true;
        const response = await api.post(
          `/admin/verifications/${selectedVerification.value.id}/reject`,
          {
            reason: rejectionReason.value,
          },
        );

        if (response.data.success) {
          message.success('认证已拒绝');
          showDetailModal.value = false;
          await fetchVerifications();
        } else {
          message.error(response.data.message);
        }
      } catch (error) {
        console.error('拒绝失败:', error);
        message.error('拒绝失败');
      } finally {
        rejectLoading.value = false;
      }
    },
  });
};

const handleSearch = () => {
  // 搜索逻辑已在 computed 中处理
};

const handleFilter = () => {
  // 过滤逻辑已在 computed 中处理
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
    title: '真实姓名',
    key: 'realName',
    width: 120,
  },
  {
    title: '身份证号',
    key: 'idCard',
    width: 180,
    render(row) {
      const idCard = row.idCard || '';
      if (idCard.length > 6) {
        return idCard.substring(0, 6) + '****' + idCard.substring(idCard.length - 4);
      }
      return idCard;
    },
  },
  {
    title: '手机号码',
    key: 'phone',
    width: 120,
    render(row) {
      const phone = row.phone || '';
      if (phone.length > 7) {
        return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4);
      }
      return phone;
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row) {
      return h(
        NTag,
        {
          type: getStatusType(row.status),
          size: 'small',
        },
        { default: () => getStatusText(row.status) },
      );
    },
  },
  {
    title: '申请时间',
    key: 'createdAt',
    width: 160,
    render(row) {
      return formatDate(row.createdAt);
    },
  },
  {
    title: '审核时间',
    key: 'reviewedAt',
    width: 160,
    render(row) {
      return formatDate(row.reviewedAt);
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render(row) {
      return h('div', { style: 'display: flex; gap: 8px;' }, [
        h(
          NButton,
          {
            size: 'small',
            onClick: () => viewVerification(row),
          },
          { default: () => '查看详情' },
        ),
      ]);
    },
  },
];

const fetchVerifications = async () => {
  try {
    loading.value = true;
    const response = await api.get('/admin/verifications');
    verifications.value = response.data.data || [];
  } catch (error) {
    console.error('获取认证列表失败:', error);
    message.error('获取认证列表失败');
  } finally {
    loading.value = false;
  }
};

const refreshVerifications = async () => {
  await fetchVerifications();
  message.success('认证列表已刷新');
};

onMounted(async () => {
  await fetchVerifications();
});
</script>

<style scoped>
.admin-verification {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.verification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.verification-header h1 {
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

.verification-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  text-align: center;
}

.verification-table-card {
  width: 100%;
}

.verification-details {
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

.rejection-reason {
  padding: 12px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 14px;
  line-height: 1.5;
}

.review-actions {
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .admin-verification {
    padding: 16px;
  }

  .verification-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .verification-stats {
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
