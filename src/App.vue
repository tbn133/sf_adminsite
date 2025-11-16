<template>
  <q-layout view="hHh lpR fFf" class="modern-layout">
    <q-header elevated class="header-gradient">
      <q-toolbar class="q-px-lg q-py-sm">
        <q-btn
          flat
          dense
          round
          icon="menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
          class="q-mr-md toolbar-btn"
          size="md"
        />
        <q-toolbar-title class="row items-center no-wrap">
          <div class="logo-container">
            <q-icon name="eco" size="32px" class="logo-icon" />
          </div>
          <div class="column q-ml-md">
            <span class="text-h6 text-weight-bold">Smart Farming</span>
            <span class="text-caption text-weight-light opacity-80">Admin Dashboard</span>
          </div>
        </q-toolbar-title>
        <q-space />
        <div class="row items-center q-gutter-sm">
          <q-btn flat round dense icon="search" class="toolbar-btn" size="md">
            <q-tooltip>{{ $t('common.search') }}</q-tooltip>
          </q-btn>
          <LanguageSwitcher />
          <NotificationCenter />
          <q-separator vertical dark class="q-mx-sm" />
          <q-btn flat round class="toolbar-btn" size="md">
            <q-avatar size="36px" color="white" text-color="primary">
              <q-icon name="person" size="20px" />
            </q-avatar>
            <q-tooltip>{{ $t('common.account') }}</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="280"
      :breakpoint="1024"
      class="modern-drawer"
    >
      <q-scroll-area class="fit">
        <div class="drawer-header q-pa-lg">
          <div class="text-overline text-grey-6 q-mb-xs">NAVIGATION</div>
          <div class="text-body2 text-grey-7">Quản lý hệ thống</div>
        </div>

        <q-list padding class="menu-list q-px-md">
          <q-item
            clickable
            v-ripple
            :to="{ name: 'dashboard' }"
            exact
            active-class="menu-item-active"
            class="menu-item q-mb-xs"
          >
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">Dashboard</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />
          <div class="text-overline text-grey-6 q-px-md q-mb-sm">QUẢN LÝ</div>

          <q-item
            clickable
            v-ripple
            :to="{ name: 'devices' }"
            active-class="menu-item-active"
            class="menu-item q-mb-xs"
          >
            <q-item-section avatar>
              <q-icon name="devices" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">Thiết bị</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            :to="{ name: 'schedules' }"
            active-class="menu-item-active"
            class="menu-item q-mb-xs"
          >
            <q-item-section avatar>
              <q-icon name="schedule" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">Lịch trình</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            :to="{ name: 'rules' }"
            active-class="menu-item-active"
            class="menu-item q-mb-xs"
          >
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">Quy tắc</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />
          <div class="text-overline text-grey-6 q-px-md q-mb-sm">GROW RECIPES</div>

          <q-item
            clickable
            v-ripple
            :to="{ name: 'recipes' }"
            active-class="menu-item-active"
            class="menu-item q-mb-xs"
          >
            <q-item-section avatar>
              <q-icon name="eco" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">Công thức trồng</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            :to="{ name: 'recipe-executions' }"
            active-class="menu-item-active"
            class="menu-item q-mb-xs"
          >
            <q-item-section avatar>
              <q-icon name="play_circle" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">Trồng trọt đang chạy</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />
          <div class="text-overline text-grey-6 q-px-md q-mb-sm">DỮ LIỆU</div>

          <q-item
            clickable
            v-ripple
            :to="{ name: 'export' }"
            active-class="menu-item-active"
            class="menu-item q-mb-xs"
          >
            <q-item-section avatar>
              <q-icon name="file_download" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">Xuất dữ liệu</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            :to="{ name: 'pairings' }"
            active-class="menu-item-active"
            class="menu-item q-mb-xs"
          >
            <q-item-section avatar>
              <q-icon name="sync" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">Kết nối</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <div class="drawer-footer q-pa-lg q-mt-xl">
          <q-card flat bordered class="bg-primary-light">
            <q-card-section class="q-pa-md">
              <div class="text-caption text-grey-7 q-mb-xs">Phiên bản</div>
              <div class="text-body2 text-weight-medium text-primary">v1.0.0</div>
            </q-card-section>
          </q-card>
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import NotificationCenter from '@/components/NotificationCenter.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const leftDrawerOpen = ref(true)
</script>

<style scoped>
.modern-layout {
  background: #f8f9fa;
}

.header-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toolbar-btn {
  transition: all 0.3s ease;
}

.toolbar-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.logo-container {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.logo-icon {
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.modern-drawer {
  background: #ffffff;
  border-right: 1px solid #e0e0e0;
}

.drawer-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e0e0e0;
}

.menu-list {
  padding-top: 8px;
}

.menu-item {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.menu-item:hover::before {
  opacity: 0.08;
}

.menu-item:hover {
  transform: translateX(4px);
}

.menu-item-active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%);
  border-left: 4px solid #667eea;
  font-weight: 600;
}

.menu-item-active::before {
  opacity: 0.12;
}

.menu-item-active .q-item__label {
  color: #667eea;
  font-weight: 600;
}

.menu-item-active .q-icon {
  color: #667eea;
}

.drawer-footer {
  position: relative;
}

.bg-primary-light {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

/* Page transitions */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

<style>
body {
  margin: 0;
  font-family:
    'Inter',
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.q-page {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
