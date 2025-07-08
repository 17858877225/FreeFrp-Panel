<template>
  <div class="profile">
    <div class="profile-header">
      <h1>个人中心</h1>
    </div>

    <div class="profile-content">
      <!-- 基本信息 -->
      <n-card title="基本信息" class="info-card">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">用户名</span>
            <span class="value">{{ userStore.user?.username }}</span>
          </div>
          <div class="info-item">
            <span class="label">邮箱</span>
            <span class="value">{{ userStore.user?.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">用户组</span>
            <n-tag :type="getUserGroupType(userStore.user?.userGroup)">
              {{ getUserGroupText(userStore.user?.userGroup) }}
            </n-tag>
          </div>
          <div class="info-item">
            <span class="label">访问密钥</span>
            <div class="access-key-row">
              <n-input
                :value="showAccessKey ? userStore.user?.accessKey : '••••••••••••••••'"
                readonly
                style="flex: 1; margin-right: 8px;"
              />
              <n-button size="small" @click="toggleAccessKey">
                {{ showAccessKey ? '隐藏' : '显示' }}
              </n-button>
              <n-button size="small" type="warning" @click="resetAccessKey">
                重置
              </n-button>
            </div>
          </div>
        </div>
      </n-card>

      <!-- 修改密码 -->
      <n-card title="修改密码" class="password-card">
        <n-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-placement="left"
          label-width="auto"
        >
          <n-form-item label="当前密码" path="currentPassword">
            <n-input
              v-model:value="passwordForm.currentPassword"
              type="password"
              placeholder="请输入当前密码"
              show-password-on="mousedown"
            />
          </n-form-item>
          
          <n-form-item label="新密码" path="newPassword">
            <n-input
              v-model:value="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password-on="mousedown"
            />
          </n-form-item>
          
          <n-form-item label="确认新密码" path="confirmPassword">
            <n-input
              v-model:value="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password-on="mousedown"
            />
          </n-form-item>
          
          <n-form-item>
            <n-button
              type="primary"
              :loading="passwordLoading"
              @click="handleChangePassword"
            >
              修改密码
            </n-button>
          </n-form-item>
        </n-form>
      </n-card>

      <!-- 实名认证 -->
      <n-card title="实名认证" class="verification-card">
        <div v-if="userStore.user?.realNameStatus === 'verified'" class="verified-status">
          <n-result status="success" title="已完成实名认证">
            <template #footer>
              <div class="verified-info">
                <p><strong>姓名:</strong> {{ userStore.user?.realName }}</p>
                <p><strong>身份证号:</strong> {{ maskIdCard(userStore.user?.idCard) }}</p>
                <p><strong>认证时间:</strong> {{ formatDate(userStore.user?.verifiedAt) }}</p>
              </div>
            </template>
          </n-result>
        </div>
        
        <div v-else-if="userStore.user?.realNameStatus === 'pending'" class="pending-status">
          <n-result status="info" title="实名认证审核中">
            <template #footer>
              <p>您的实名认证信息正在审核中，请耐心等待。</p>
            </template>
          </n-result>
        </div>
        
        <div v-else class="verification-form">
          <n-alert type="info" style="margin-bottom: 24px;">
            完成实名认证后，您的用户组将升级为正式用户，享受更高的带宽和隧道数量限制。
          </n-alert>
          
          <n-form
            ref="verificationFormRef"
            :model="verificationForm"
            :rules="verificationRules"
            label-placement="left"
            label-width="auto"
          >
            <n-form-item label="真实姓名" path="realName">
              <n-input
                v-model:value="verificationForm.realName"
                placeholder="请输入真实姓名"
              />
            </n-form-item>
            
            <n-form-item label="身份证号" path="idCard">
              <n-input
                v-model:value="verificationForm.idCard"
                placeholder="请输入身份证号"
              />
            </n-form-item>
            
            <n-form-item>
              <n-button
                type="primary"
                :loading="verificationLoading"
                @click="handleSubmitVerification"
              >
                提交认证
              </n-button>
            </n-form-item>
          </n-form>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  NCard,
  NTag,
  NInput,
  NButton,
  NForm,
  NFormItem,
  NAlert,
  NResult,
  useMessage,
  useDialog
} from 'naive-ui'
import { useUserStore } from '@/stores/user'

const message = useMessage()
const dialog = useDialog()
const userStore = useUserStore()

const showAccessKey = ref(false)
const passwordLoading = ref(false)
const verificationLoading = ref(false)
const passwordFormRef = ref()
const verificationFormRef = ref()

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const verificationForm = reactive({
  realName: '',
  idCard: ''
})

const validatePasswordSame = (rule: any, value: string) => {
  return value === passwordForm.newPassword
}

const validateIdCard = (rule: any, value: string) => {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return idCardRegex.test(value)
}

const passwordRules = {
  currentPassword: {
    required: true,
    message: '请输入当前密码',
    trigger: 'blur'
  },
  newPassword: [
    {
      required: true,
      message: '请输入新密码',
      trigger: 'blur'
    },
    {
      min: 6,
      message: '密码长度不能少于6位',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    {
      required: true,
      message: '请确认新密码',
      trigger: 'blur'
    },
    {
      validator: validatePasswordSame,
      message: '两次输入的密码不一致',
      trigger: 'blur'
    }
  ]
}

const verificationRules = {
  realName: {
    required: true,
    message: '请输入真实姓名',
    trigger: 'blur'
  },
  idCard: [
    {
      required: true,
      message: '请输入身份证号',
      trigger: 'blur'
    },
    {
      validator: validateIdCard,
      message: '请输入有效的身份证号',
      trigger: 'blur'
    }
  ]
}

const getUserGroupText = (group?: string) => {
  switch (group) {
    case 'unverified':
      return '未实名认证'
    case 'verified':
      return '正式用户'
    case 'sponsor':
      return '赞助者'
    case 'admin':
      return '管理员'
    default:
      return '未知'
  }
}

const getUserGroupType = (group?: string) => {
  switch (group) {
    case 'unverified':
      return 'warning'
    case 'verified':
      return 'info'
    case 'sponsor':
      return 'success'
    case 'admin':
      return 'error'
    default:
      return 'default'
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('zh-CN')
}

const maskIdCard = (idCard?: string) => {
  if (!idCard) return 'N/A'
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
}

const toggleAccessKey = () => {
  showAccessKey.value = !showAccessKey.value
}

const resetAccessKey = () => {
  dialog.warning({
    title: '确认重置',
    content: '重置访问密钥后，所有使用旧密钥的客户端将无法连接。确定要重置吗？',
    positiveText: '重置',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const result = await userStore.resetAccessKey()
        if (result.success) {
          message.success('访问密钥重置成功')
          await userStore.fetchUserInfo()
        } else {
          message.error(result.message)
        }
      } catch (error) {
        console.error('重置访问密钥失败:', error)
        message.error('重置访问密钥失败')
      }
    }
  })
}

const handleChangePassword = async () => {
  try {
    await passwordFormRef.value?.validate()
    passwordLoading.value = true
    
    const result = await userStore.changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    )
    
    if (result.success) {
      message.success('密码修改成功')
      Object.assign(passwordForm, {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } else {
      message.error(result.message)
    }
  } catch (error) {
    console.error('修改密码失败:', error)
  } finally {
    passwordLoading.value = false
  }
}

const handleSubmitVerification = async () => {
  try {
    await verificationFormRef.value?.validate()
    verificationLoading.value = true
    
    const result = await userStore.submitRealNameVerification(
      verificationForm.realName,
      verificationForm.idCard
    )
    
    if (result.success) {
      message.success('实名认证信息提交成功，已自动通过认证')
      await userStore.fetchUserInfo()
      Object.assign(verificationForm, {
        realName: '',
        idCard: ''
      })
    } else {
      message.error(result.message)
    }
  } catch (error) {
    console.error('提交实名认证失败:', error)
  } finally {
    verificationLoading.value = false
  }
}

onMounted(async () => {
  await userStore.fetchUserInfo()
})
</script>

<style scoped>
.profile {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  margin-bottom: 32px;
}

.profile-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-grid {
  display: flex;
  flex-direction: column;
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
  min-width: 80px;
}

.value {
  color: #333;
  font-weight: 500;
}

.access-key-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.verified-info {
  text-align: left;
}

.verified-info p {
  margin: 8px 0;
  color: #666;
}

.verified-info p:first-child {
  margin-top: 0;
}

.verified-info p:last-child {
  margin-bottom: 0;
}

.pending-status p {
  color: #666;
  margin: 0;
}

@media (max-width: 768px) {
  .profile {
    padding: 16px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .access-key-row {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
  
  .access-key-row .n-input {
    margin-right: 0 !important;
    margin-bottom: 8px;
  }
}
</style>