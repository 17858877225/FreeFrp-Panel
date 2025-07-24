import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tunnels',
      name: 'tunnels',
      component: () => import('@/views/Tunnels.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tunnels/create',
      name: 'tunnel-create',
      component: () => import('@/views/TunnelCreate.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/Profile.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/nodes',
      name: 'nodes',
      component: () => import('@/views/Nodes.vue'),
    },
    {
      path: '/download',
      name: 'download',
      component: () => import('@/views/Download.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/Users.vue'),
        },
        {
          path: 'tunnels',
          name: 'admin-tunnels',
          component: () => import('@/views/admin/Tunnels.vue'),
        },
        {
          path: 'nodes',
          name: 'admin-nodes',
          component: () => import('@/views/admin/Nodes.vue'),
        },
        {
          path: 'verification',
          name: 'admin-verification',
          component: () => import('@/views/admin/Verification.vue'),
        },
      ],
    },
  ],
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login');
  } else if (to.meta.requiresAdmin && userStore.user?.userGroup !== 'admin') {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
