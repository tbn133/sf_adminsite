import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Devices from '../views/Devices.vue'
import DeviceDetail from '../views/DeviceDetail.vue'
import Schedules from '../views/Schedules.vue'
import Rules from '../views/Rules.vue'
import Export from '../views/Export.vue'
import Pairings from '../views/Pairings.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard
  },
  {
    path: '/devices',
    name: 'devices',
    component: Devices
  },
  {
    path: '/devices/:deviceId',
    name: 'device-detail',
    component: DeviceDetail
  },
  {
    path: '/schedules',
    name: 'schedules',
    component: Schedules
  },
  {
    path: '/rules',
    name: 'rules',
    component: Rules
  },
  {
    path: '/export',
    name: 'export',
    component: Export
  },
  {
    path: '/pairings',
    name: 'pairings',
    component: Pairings
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

