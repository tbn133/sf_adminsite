<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-icon name="agriculture" size="md" class="q-mr-sm" />
          Smart Farming Admin
        </q-toolbar-title>
        <q-space />
        <q-btn flat round dense icon="account_circle" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Navigation</q-item-label>
        
        <q-item clickable v-ripple :to="{ name: 'dashboard' }" exact>
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboard</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'devices' }">
          <q-item-section avatar>
            <q-icon name="devices" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Thiết bị</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'schedules' }">
          <q-item-section avatar>
            <q-icon name="schedule" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Lịch trình</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'rules' }">
          <q-item-section avatar>
            <q-icon name="rule" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Rules</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'export' }">
          <q-item-section avatar>
            <q-icon name="download" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Xuất dữ liệu</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'pairings' }">
          <q-item-section avatar>
            <q-icon name="link" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Pairing Requests</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(true)
</script>

<style>
body {
  margin: 0;
}
</style>

