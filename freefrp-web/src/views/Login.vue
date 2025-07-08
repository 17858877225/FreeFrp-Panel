<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>FreeFrp</h1>
          <p>登录您的账户</p>
        </div>
        
        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          size="large"
          @submit.prevent="handleLogin"
        >
          <n-form-item path="username">
            <n-input
              v-model:value="formData.username"
              placeholder="用户名或邮箱"
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
          
          <n-form-item path="password">
            <n-input
              v-model:value="formData.password"
              type="password"
              placeholder="密码"
              show-password-on="mousedown"
              :input-props="{ autocomplete: 'current-password' }"
              @keyup.enter="handleLogin"
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
              登录
            </n-button>
          </n-form-item>
        </n-form>
        
        <div class="login-footer">
          <p>
            还没有账户？
            <router-link to="/register" class="link">立即注册</router-link>
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
  password: ''
})

const rules = {
  username: {
    required: true,
    message: '请输入用户名或邮箱',
    trigger: 'blur'
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: 'blur'
  }
}

const handleLogin = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    
    const result = await userStore.login(formData.username, formData.password)
    
    if (result.success) {
      message.success('登录成功')
      await userStore.fetchUserInfo()
      router.push('/dashboard')
    } else {
      message.error(result.message)
    }
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 48px 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-header p {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
}

.login-footer p {
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
  .login-card {
    padding: 32px 24px;
  }
}
</style>