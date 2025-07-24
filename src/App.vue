<template>
  <n-config-provider :theme="theme" :locale="zhCN" :date-locale="dateZhCN">
    <n-global-style />
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
            <router-view />
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  NConfigProvider,
  NGlobalStyle,
  NLoadingBarProvider,
  NDialogProvider,
  NNotificationProvider,
  NMessageProvider,
  zhCN,
  dateZhCN,
  darkTheme,
} from 'naive-ui';

const theme = ref(null); // 可以设置为 darkTheme 来启用暗色主题
</script>

<style>
#app {
  font-family: 'Lato', sans-serif;
}

body {
  margin: 0;
  padding: 0;
}
</style>
