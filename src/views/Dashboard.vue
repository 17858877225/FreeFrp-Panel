<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>欢迎回来，{{ userStore.user?.username || '用户' }}</h1>
      <p class="user-id">用户 ID: {{ userStore.user?.id || 'N/A' }}</p>
    </div>

    <div class="dashboard-content">
      <!-- 用户信息卡片 -->
      <n-card title="用户信息" class="user-info-card">
        <div class="user-info-grid">
          <div class="info-item">
            <span class="label">用户名</span>
            <span class="value">{{ userStore.user?.username || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">用户 ID</span>
            <span class="value">{{ userStore.user?.id || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">实名认证</span>
            <n-tag :type="userStore.user?.realNameStatus === 'verified' ? 'success' : 'warning'">
              {{ getRealNameStatusText(userStore.user?.realNameStatus) }}
            </n-tag>
          </div>
          <div class="info-item">
            <span class="label">用户组</span>
            <n-tag :type="getUserGroupType(userStore.user?.userGroup)">
              {{ getUserGroupText(userStore.user?.userGroup) }}
            </n-tag>
          </div>
          <div class="info-item">
            <span class="label">注册时间</span>
            <span class="value">{{ formatDate(userStore.user?.createdAt) }}</span>
          </div>
          <div class="info-item">
            <span class="label">注册邮箱</span>
            <span class="value">{{ userStore.user?.email || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">隧道数量</span>
            <span class="value"
              >{{ userStore.user?.tunnelCount || 0 }} /
              {{ getUserGroupLimits(userStore.user?.userGroup).tunnelLimit }}</span
            >
          </div>
          <div class="info-item">
            <span class="label">剩余流量</span>
            <span class="value">{{ formatBytes(userStore.user?.remainingTraffic || 0) }}</span>
          </div>
          <div class="info-item">
            <span class="label">入站带宽</span>
            <span class="value">{{
              getUserGroupLimits(userStore.user?.userGroup).inboundBandwidth
            }}</span>
          </div>
          <div class="info-item">
            <span class="label">出站带宽</span>
            <span class="value">{{
              getUserGroupLimits(userStore.user?.userGroup).outboundBandwidth
            }}</span>
          </div>
        </div>
      </n-card>

      <!-- 签到卡片 -->
      <n-card title="每日签到" class="checkin-card">
        <div class="checkin-content">
          <div class="checkin-info">
            <p>连续签到天数: {{ userStore.user?.consecutiveCheckinDays || 0 }} 天</p>
            <p>
              今日签到状态:
              <n-tag :type="userStore.user?.hasCheckedInToday ? 'success' : 'default'">
                {{ userStore.user?.hasCheckedInToday ? '已签到' : '未签到' }}
              </n-tag>
            </p>
          </div>
          <n-button
            type="primary"
            size="large"
            :disabled="userStore.user?.hasCheckedInToday || checkinLoading"
            :loading="checkinLoading"
            @click="handleCheckin"
          >
            {{ userStore.user?.hasCheckedInToday ? '今日已签到' : '签到' }}
          </n-button>
        </div>
      </n-card>

      <!-- 公告卡片 -->
      <n-card title="系统公告" class="announcement-card">
        <div v-if="announcements.length > 0" class="announcements">
          <div
            v-for="announcement in announcements"
            :key="announcement.id"
            class="announcement-item"
          >
            <div class="announcement-header">
              <h4>{{ announcement.title }}</h4>
              <span class="announcement-date">{{ formatDate(announcement.createdAt) }}</span>
            </div>
            <p class="announcement-content">{{ announcement.content }}</p>
          </div>
        </div>
        <div v-else class="no-announcements">
          <p>暂无公告</p>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NCard, NTag, NButton, useMessage } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import { api } from '@/api/index';

const userStore = useUserStore();
const message = useMessage();

const checkinLoading = ref(false);
const announcements = ref<any[]>([]);

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

const getUserGroupLimits = (group?: string) => {
  switch (group) {
    case 'unverified':
      return {
        tunnelLimit: 3,
        inboundBandwidth: '8 Mbps',
        outboundBandwidth: '8 Mbps',
      };
    case 'verified':
      return {
        tunnelLimit: 10,
        inboundBandwidth: '24 Mbps',
        outboundBandwidth: '24 Mbps',
      };
    case 'sponsor':
      return {
        tunnelLimit: 25,
        inboundBandwidth: '128 Mbps',
        outboundBandwidth: '128 Mbps',
      };
    case 'admin':
      return {
        tunnelLimit: '无限制',
        inboundBandwidth: '无限制',
        outboundBandwidth: '无限制',
      };
    default:
      return {
        tunnelLimit: 0,
        inboundBandwidth: '0 Mbps',
        outboundBandwidth: '0 Mbps',
      };
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

const handleCheckin = async () => {
  try {
    checkinLoading.value = true;
    const result = await userStore.checkin();

    if (result.success) {
      message.success(`签到成功！获得 ${result.data.reward} 流量奖励`);
      await userStore.fetchUserInfo();
    } else {
      message.error(result.message);
    }
  } catch (error) {
    console.error('签到失败:', error);
    message.error('签到失败，请稍后重试');
  } finally {
    checkinLoading.value = false;
  }
};

const fetchAnnouncements = async () => {
  try {
    const response = await api.get('/announcements');
    announcements.value = response.data.data || [];
  } catch (error) {
    console.error('获取公告失败:', error);
  }
};

onMounted(async () => {
  await userStore.fetchUserInfo();
  await fetchAnnouncements();
});
</script>

<style scoped>
.dashboard {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 32px;
}

.dashboard-header h1 {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.user-id {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.dashboard-content {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
}

.user-info-card {
  grid-column: 1 / -1;
}

.user-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #666;
}

.value {
  color: #333;
  font-weight: 500;
}

.checkin-card {
  grid-column: 1 / -1;
}

.checkin-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.checkin-info p {
  margin: 0 0 8px 0;
  color: #666;
}

.checkin-info p:last-child {
  margin-bottom: 0;
}

.announcement-card {
  grid-column: 1 / -1;
}

.announcements {
  max-height: 400px;
  overflow-y: auto;
}

.announcement-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.announcement-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.announcement-date {
  color: #999;
  font-size: 0.9rem;
}

.announcement-content {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.no-announcements {
  text-align: center;
  color: #999;
  padding: 32px 0;
}

.no-announcements p {
  margin: 0;
}

@media (min-width: 768px) {
  .dashboard-content {
    grid-template-columns: 2fr 1fr;
  }

  .checkin-card,
  .announcement-card {
    grid-column: 2;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .user-info-grid {
    grid-template-columns: 1fr;
  }

  .checkin-content {
    flex-direction: column;
    align-items: stretch;
  }

  .announcement-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
