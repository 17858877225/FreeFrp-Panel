import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api/index'

export interface User {
  id: number
  username: string
  email: string
  userGroup: 'unverified' | 'verified' | 'sponsor' | 'admin'
  realNameVerified: boolean
  accessKey: string
  tunnelCount: number
  remainingTraffic: number
  inboundBandwidth: number
  outboundBandwidth: number
  registrationTime: string
  lastSignIn?: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.userGroup === 'admin')
  const isVerified = computed(() => user.value?.realNameVerified || false)

  // 用户组限制配置
  const userGroupLimits = computed(() => {
    const group = user.value?.userGroup || 'unverified'
    const limits = {
      unverified: {
        tunnelLimit: 3,
        bandwidthLimit: 8, // Mbps
        name: '未实名认证'
      },
      verified: {
        tunnelLimit: 10,
        bandwidthLimit: 24,
        name: '正式用户'
      },
      sponsor: {
        tunnelLimit: 25,
        bandwidthLimit: 128,
        name: '赞助者'
      },
      admin: {
        tunnelLimit: -1, // 无限制
        bandwidthLimit: -1,
        name: '管理员'
      }
    }
    return limits[group]
  })

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password })
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('token', token.value)
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '登录失败' }
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { username, email, password })
      return { success: true, message: '注册成功，请登录' }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '注册失败' }
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  const fetchUserInfo = async () => {
    if (!token.value) return
    try {
      const response = await api.get('/user/info')
      user.value = response.data
    } catch (error) {
      logout()
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await api.put('/user/profile', data)
      user.value = { ...user.value!, ...response.data }
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '更新失败' }
    }
  }

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await api.put('/user/password', { oldPassword, newPassword })
      return { success: true, message: '密码修改成功' }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '密码修改失败' }
    }
  }

  const resetAccessKey = async () => {
    try {
      const response = await api.post('/user/reset-access-key')
      if (user.value) {
        user.value.accessKey = response.data.accessKey
      }
      return { success: true, accessKey: response.data.accessKey }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '重置失败' }
    }
  }

  const submitRealNameVerification = async (realName: string, idCard: string) => {
    try {
      await api.post('/user/real-name-verification', { realName, idCard })
      if (user.value) {
        user.value.realNameVerified = true
        user.value.userGroup = 'verified'
      }
      return { success: true, message: '实名认证成功' }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '实名认证失败' }
    }
  }

  const signIn = async () => {
    try {
      const response = await api.post('/user/sign-in')
      if (user.value) {
        user.value.remainingTraffic += response.data.reward
        user.value.lastSignIn = new Date().toISOString()
      }
      return { success: true, reward: response.data.reward }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '签到失败' }
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    isVerified,
    userGroupLimits,
    login,
    register,
    logout,
    fetchUserInfo,
    updateProfile,
    changePassword,
    resetAccessKey,
    submitRealNameVerification,
    signIn
  }
})