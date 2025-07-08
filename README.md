# FreeFrp Web Frontend

基于 Vue 3 + TypeScript + Naive UI 的免费内网穿透服务前端项目。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集，提供类型安全
- **Naive UI** - Vue 3 组件库
- **Vite** - 下一代前端构建工具
- **Vue Router** - Vue.js 官方路由管理器
- **Pinia** - Vue 状态管理库
- **Axios** - HTTP 客户端

## 功能特性

### 用户功能
- 用户注册/登录
- 用户仪表盘
- 隧道管理（创建、编辑、删除、查看配置）
- 个人资料管理
- 密码修改
- 实名认证
- 访问密钥管理
- 节点状态查看
- 客户端下载
- 每日签到

### 管理员功能
- 用户管理（查看、封禁、修改用户组）
- 隧道管理（查看、下线、删除）
- 节点管理（添加、编辑、启用/禁用、删除）
- 实名认证审核

### 用户组权限
- **未实名认证**: 限速 8Mbps，最多 3 条隧道
- **正式用户**: 限速 24Mbps，最多 10 条隧道
- **赞助者**: 限速 128Mbps，最多 25 条隧道
- **管理员**: 无限制

## 项目结构

```
src/
├── api/                 # API 接口
│   └── index.ts
├── components/          # 公共组件
├── router/             # 路由配置
│   └── index.ts
├── stores/             # 状态管理
│   └── user.ts
├── views/              # 页面组件
│   ├── Home.vue        # 首页
│   ├── Login.vue       # 登录页
│   ├── Register.vue    # 注册页
│   ├── Dashboard.vue   # 用户仪表盘
│   ├── Tunnels.vue     # 隧道管理
│   ├── Profile.vue     # 个人资料
│   ├── Nodes.vue       # 节点状态
│   ├── Download.vue    # 客户端下载
│   └── admin/          # 管理员页面
│       ├── Users.vue   # 用户管理
│       ├── Tunnels.vue # 隧道管理
│       ├── Nodes.vue   # 节点管理
│       └── Verification.vue # 实名认证管理
├── App.vue             # 根组件
└── main.ts             # 入口文件
```

## 开发环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

## 安装依赖

```bash
npm install
```

## 开发

```bash
npm run dev
```

项目将在 http://localhost:3000 启动

## 构建

```bash
npm run build
```

构建产物将输出到 `dist` 目录

## 预览构建结果

```bash
npm run preview
```

## 类型检查

```bash
npm run type-check
```

## 代码格式化

```bash
npm run format
```

## API 配置

项目通过 Vite 代理配置与后端 API 通信：

- 开发环境：`/api` 代理到 `http://localhost:8080`
- 生产环境：需要配置实际的 API 地址

## 环境变量

可以创建 `.env.local` 文件来配置环境变量：

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=FreeFrp
```

## 部署

1. 构建项目：`npm run build`
2. 将 `dist` 目录部署到 Web 服务器
3. 配置 Web 服务器支持 SPA 路由（如 Nginx 的 `try_files`）

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend-server:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目地址：[GitHub Repository]
- 问题反馈：[GitHub Issues]
- 邮箱：[your-email@example.com]