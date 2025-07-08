<template>
  <div class="download">
    <div class="download-header">
      <h1>客户端下载</h1>
      <p>选择适合您操作系统的FRP客户端</p>
    </div>

    <div class="download-content">
      <!-- 下载说明 -->
      <n-card title="使用说明" class="instruction-card">
        <div class="instructions">
          <ol>
            <li>根据您的操作系统选择对应的客户端版本</li>
            <li>下载并解压到任意目录</li>
            <li>在隧道管理页面创建隧道并获取配置文件</li>
            <li>将配置文件保存为 <code>frpc.ini</code></li>
            <li>运行命令：<code>./frpc -c frpc.ini</code></li>
          </ol>
        </div>
      </n-card>

      <!-- 下载链接 -->
      <div class="download-grid">
        <n-card
          v-for="client in clients"
          :key="client.platform"
          class="download-card"
          :title="client.name"
        >
          <template #header-extra>
            <n-icon size="24" :color="client.color">
              <component :is="client.icon" />
            </n-icon>
          </template>
          
          <div class="download-info">
            <div class="info-row">
              <span class="label">平台:</span>
              <span class="value">{{ client.platform }}</span>
            </div>
            <div class="info-row">
              <span class="label">架构:</span>
              <span class="value">{{ client.arch }}</span>
            </div>
            <div class="info-row">
              <span class="label">版本:</span>
              <span class="value">{{ client.version }}</span>
            </div>
            <div class="info-row">
              <span class="label">大小:</span>
              <span class="value">{{ client.size }}</span>
            </div>
          </div>
          
          <template #action>
            <div class="download-actions">
              <n-button
                type="primary"
                :href="client.downloadUrl"
                :disabled="!client.downloadUrl"
                tag="a"
                target="_blank"
                block
              >
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                    </svg>
                  </n-icon>
                </template>
                {{ client.downloadUrl ? '下载' : '暂未提供' }}
              </n-button>
            </div>
          </template>
        </n-card>
      </div>

      <!-- 配置示例 -->
      <n-card title="配置文件示例" class="config-example-card">
        <n-alert type="info" style="margin-bottom: 16px;">
          以下是一个基本的配置文件示例，实际使用时请在隧道管理页面生成具体配置。
        </n-alert>
        
        <n-code
          :code="configExample"
          language="ini"
          show-line-numbers
        />
      </n-card>

      <!-- 常见问题 -->
      <n-card title="常见问题" class="faq-card">
        <n-collapse>
          <n-collapse-item title="如何运行客户端？" name="1">
            <p>下载对应平台的客户端后，解压到任意目录。在命令行中进入该目录，运行：</p>
            <ul>
              <li>Windows: <code>frpc.exe -c frpc.ini</code></li>
              <li>Linux/macOS: <code>./frpc -c frpc.ini</code></li>
            </ul>
          </n-collapse-item>
          
          <n-collapse-item title="客户端无法连接怎么办？" name="2">
            <p>请检查以下几点：</p>
            <ul>
              <li>确认配置文件中的服务器地址和端口正确</li>
              <li>确认访问密钥（user）正确</li>
              <li>确认网络连接正常</li>
              <li>检查防火墙设置</li>
            </ul>
          </n-collapse-item>
          
          <n-collapse-item title="如何后台运行客户端？" name="3">
            <p>可以使用以下方法后台运行：</p>
            <ul>
              <li>Linux: <code>nohup ./frpc -c frpc.ini &</code></li>
              <li>Windows: 使用任务计划程序或第三方工具</li>
              <li>使用 systemd 服务（Linux）</li>
            </ul>
          </n-collapse-item>
          
          <n-collapse-item title="支持哪些协议？" name="4">
            <p>FreeFrp 支持以下协议：</p>
            <ul>
              <li>TCP - 适用于大多数应用</li>
              <li>UDP - 适用于游戏、DNS等</li>
              <li>HTTP - 适用于网站</li>
              <li>HTTPS - 适用于加密网站</li>
            </ul>
          </n-collapse-item>
        </n-collapse>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  NCard,
  NButton,
  NIcon,
  NCode,
  NAlert,
  NCollapse,
  NCollapseItem,
  useMessage
} from 'naive-ui'
import { api } from '@/api/index'

const message = useMessage()

const clients = ref<any[]>([
  {
    name: 'Windows 64位',
    platform: 'Windows',
    arch: 'amd64',
    version: 'v0.52.3',
    size: '8.2 MB',
    color: '#0078d4',
    downloadUrl: '',
    icon: 'WindowsIcon'
  },
  {
    name: 'Windows 32位',
    platform: 'Windows',
    arch: '386',
    version: 'v0.52.3',
    size: '7.8 MB',
    color: '#0078d4',
    downloadUrl: '',
    icon: 'WindowsIcon'
  },
  {
    name: 'Linux 64位',
    platform: 'Linux',
    arch: 'amd64',
    version: 'v0.52.3',
    size: '8.5 MB',
    color: '#f7931e',
    downloadUrl: '',
    icon: 'LinuxIcon'
  },
  {
    name: 'Linux ARM64',
    platform: 'Linux',
    arch: 'arm64',
    version: 'v0.52.3',
    size: '8.1 MB',
    color: '#f7931e',
    downloadUrl: '',
    icon: 'LinuxIcon'
  },
  {
    name: 'macOS 64位',
    platform: 'macOS',
    arch: 'amd64',
    version: 'v0.52.3',
    size: '8.3 MB',
    color: '#000000',
    downloadUrl: '',
    icon: 'AppleIcon'
  },
  {
    name: 'macOS ARM64',
    platform: 'macOS',
    arch: 'arm64',
    version: 'v0.52.3',
    size: '8.0 MB',
    color: '#000000',
    downloadUrl: '',
    icon: 'AppleIcon'
  }
])

const configExample = `serverAddr = "节点IP地址"
serverPort = 7000
user = "您的访问密钥"

[auth]
method = "token"
token = "FreeFrp"

[[proxies]]
name = "web"
type = "http"
localIP = "127.0.0.1"
localPort = 80
customDomains = ["example.com"]

[[proxies]]
name = "ssh"
type = "tcp"
localIP = "127.0.0.1"
localPort = 22
remotePort = 6000`

const fetchDownloadLinks = async () => {
  try {
    const response = await api.get('/download/links')
    if (response.data.success && response.data.data) {
      const links = response.data.data
      clients.value.forEach(client => {
        const key = `${client.platform.toLowerCase()}_${client.arch}`
        if (links[key]) {
          client.downloadUrl = links[key]
        }
      })
    }
  } catch (error) {
    console.error('获取下载链接失败:', error)
    // 不显示错误消息，因为管理员可能还未配置下载链接
  }
}

onMounted(async () => {
  await fetchDownloadLinks()
})
</script>

<style scoped>
.download {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.download-header {
  text-align: center;
  margin-bottom: 32px;
}

.download-header h1 {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.download-header p {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

.download-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.instruction-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.instructions {
  color: #333;
}

.instructions ol {
  margin: 0;
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.instructions code {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.download-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.download-card {
  height: fit-content;
}

.download-info {
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

.download-actions {
  display: flex;
  gap: 8px;
}

.config-example-card,
.faq-card {
  width: 100%;
}

.faq-card ul {
  margin: 8px 0;
  padding-left: 20px;
}

.faq-card li {
  margin-bottom: 4px;
}

.faq-card code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

@media (max-width: 768px) {
  .download {
    padding: 16px;
  }
  
  .download-grid {
    grid-template-columns: 1fr;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>