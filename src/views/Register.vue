<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1>FreeFrp</h1>
          <p>创建您的账户</p>
        </div>
        
        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          size="large"
          @submit.prevent="handleRegister"
        >
          <n-form-item path="username">
            <n-input
              v-model:value="formData.username"
              placeholder="用户名"
              :input-props="{ autocomplete: 'username' }"
            >
              <template #prefix>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                  </svg>
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          
          <n-form-item path="email">
            <n-input
              v-model:value="formData.email"
              placeholder="邮箱地址"
              :input-props="{ autocomplete: 'email' }"
            >
              <template #prefix>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
                  </svg>
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          
          <n-form-item path="password">
            <n-input
              v-model:value="formData.password"
              type="password"
              placeholder="密码"
              show-password-on="mousedown"
              :input-props="{ autocomplete: 'new-password' }"
            >
              <template #prefix>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
                  </svg>
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          
          <n-form-item path="confirmPassword">
            <n-input
              v-model:value="formData.confirmPassword"
              type="password"
              placeholder="确认密码"
              show-password-on="mousedown"
              :input-props="{ autocomplete: 'new-password' }"
              @keyup.enter="handleRegister"
            >
              <template #prefix>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
                  </svg>
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          
          <n-form-item>
            <n-button
              type="primary"
              size="large"
              :loading="loading"
              :disabled="loading"
              attr-type="submit"
              block
            >
              注册
            </n-button>
          </n-form-item>
        </n-form>
        
        <div class="register-footer">
          <p>
            已有账户？
            <router-link to="/login" class="link">立即登录</router-link>
          </p>
          <router-link to="/" class="link">返回首页</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NIcon, useMessage } from 'naive-ui'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)

const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validatePasswordSame = (rule: any, value: string) => {
  return value === formData.password
}

const rules = {
  username: {
    required: true,
    message: '请输入用户名',
    trigger: 'blur'
  },
  email: [
    {
      required: true,
      message: '请输入邮箱地址',
      trigger: 'blur'
    },
    {
      type: 'email',
      message: '请输入有效的邮箱地址',
      trigger: 'blur'
    }
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
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
      message: '请确认密码',
      trigger: 'blur'
    },
    {
      validator: validatePasswordSame,
      message: '两次输入的密码不一致',
      trigger: 'blur'
    }
  ]
}

const handleRegister = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    
    const result = await userStore.register(formData.username, formData.email, formData.password)
    
    if (result.success) {
      message.success('注册成功，请登录')
      router.push('/login')
    } else {
      message.error(result.message)
    }
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.register-container {
  width: 100%;
  max-width: 400px;
}

.register-card {
  background: white;
  border-radius: 12px;
  padding: 48px 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-header h1 {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.register-header p {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.register-footer {
  text-align: center;
  margin-top: 24px;
}

.register-footer p {
  margin: 0 0 16px 0;
  color: #666;
}

.link {
  color: #2080f0;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-card {
    padding: 32px 24px;
  }
}
</style>