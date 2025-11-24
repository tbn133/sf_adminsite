<template>
  <q-page class="users-page">
    <div class="page-container q-pa-lg">
      <!-- Header -->
      <div class="page-header q-mb-xl">
        <div>
          <div class="text-h3 text-weight-bold text-grey-9 q-mb-xs">
            <q-icon name="people" size="36px" class="q-mr-sm" color="primary" />
            Quản lý Users
          </div>
          <div class="text-body1 text-grey-6">Manage users, tiers, and device assignments</div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stat-card" flat>
            <q-card-section>
              <div class="text-grey-6 text-caption">Tổng Users</div>
              <div class="text-h4 text-weight-bold text-primary">{{ users.length }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stat-card" flat>
            <q-card-section>
              <div class="text-grey-6 text-caption">Active Users</div>
              <div class="text-h4 text-weight-bold text-positive">
                {{ users.filter(u => u.is_active).length }}
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stat-card" flat>
            <q-card-section>
              <div class="text-grey-6 text-caption">Verified</div>
              <div class="text-h4 text-weight-bold text-info">
                {{ users.filter(u => u.is_verified).length }}
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stat-card" flat>
            <q-card-section>
              <div class="text-grey-6 text-caption">Total Devices</div>
              <div class="text-h4 text-weight-bold text-orange">{{ totalDevices }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Filters -->
      <q-card class="modern-card q-mb-md" flat>
        <q-card-section>
          <div class="row q-col-gutter-md items-center">
            <div class="col-12 col-md-6">
              <q-input
                v-model="filter"
                placeholder="Tìm kiếm email, username..."
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="statusFilter"
                :options="statusOptions"
                label="Status"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-3">
              <q-btn
                color="primary"
                icon="refresh"
                label="Refresh"
                unelevated
                @click="fetchUsers"
                :loading="loading"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Users Table -->
      <q-card class="modern-card" flat>
        <q-table
          :rows="filteredUsers"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="pagination"
          class="users-table"
        >
          <template v-slot:body-cell-email="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ props.row.email }}</div>
              <div class="text-caption text-grey-6">{{ props.row.username }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.is_active ? 'positive' : 'negative'"
                text-color="white"
                dense
                size="sm"
              >
                {{ props.row.is_active ? 'Active' : 'Inactive' }}
              </q-chip>
              <q-chip
                v-if="props.row.is_verified"
                color="info"
                text-color="white"
                dense
                size="sm"
                icon="verified"
              >
                Verified
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-devices="props">
            <q-td :props="props">
              <q-chip color="primary" text-color="white" dense>
                {{ getUserDeviceCount(props.row.id) }} devices
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-tier="props">
            <q-td :props="props">
              <q-chip
                :color="getTierColor(getUserTier(props.row.id))"
                text-color="white"
                dense
                size="sm"
              >
                {{ getUserTier(props.row.id) || 'Basic' }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="row q-gutter-xs no-wrap">
                <q-btn
                  flat
                  round
                  dense
                  icon="devices"
                  color="primary"
                  @click="showUserDevices(props.row)"
                  size="sm"
                >
                  <q-tooltip>View Devices</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="add_circle"
                  color="secondary"
                  @click="assignDevice(props.row)"
                  size="sm"
                >
                  <q-tooltip>Assign Device</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="info"
                  @click="editUser(props.row)"
                  size="sm"
                >
                  <q-tooltip>Edit Tier</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- User Devices Dialog -->
    <q-dialog v-model="showDevicesDialog" persistent>
      <q-card style="min-width: 700px; max-width: 90vw">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Devices - {{ selectedUser?.email }}</div>
          <div class="text-caption">{{ selectedUser?.full_name || selectedUser?.username }}</div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle2 text-grey-7 q-mb-md">
            Device Limit: {{ userDevices.length }} / {{ getDeviceLimit(selectedUser?.id) }}
            <q-chip
              v-if="userDevices.length >= getDeviceLimit(selectedUser?.id)"
              color="warning"
              text-color="white"
              size="sm"
              class="q-ml-sm"
            >
              Limit Reached
            </q-chip>
          </div>

          <q-list bordered separator v-if="userDevices.length > 0">
            <q-item v-for="device in userDevices" :key="device.id">
              <q-item-section avatar>
                <q-icon
                  :name="device.online ? 'wifi' : 'wifi_off'"
                  :color="device.online ? 'positive' : 'grey'"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ device.device_id }}</q-item-label>
                <q-item-label caption>{{ device.name }}</q-item-label>
                <q-item-label caption>
                  Nickname: {{ device.nickname || '-' }} | Primary:
                  {{ device.is_primary ? 'Yes' : 'No' }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  @click="removeDeviceFromUser(device)"
                  size="sm"
                >
                  <q-tooltip>Remove Device</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else class="text-center text-grey-6 q-pa-lg">
            <q-icon name="devices_other" size="3em" />
            <div class="q-mt-sm">No devices assigned</div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Assign New Device"
            color="primary"
            icon="add"
            @click="assignDeviceFromDialog"
            :disable="userDevices.length >= getDeviceLimit(selectedUser?.id)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Assign Device Dialog -->
    <q-dialog v-model="showAssignDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-secondary text-white">
          <div class="text-h6">Assign Device to User</div>
          <div class="text-caption">{{ selectedUser?.email }}</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="selectedDevice"
            :options="availableDevices"
            option-label="device_id"
            option-value="id"
            label="Select Device"
            outlined
            emit-value
            map-options
            use-input
            @filter="filterDevices"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.device_id }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.name }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip
                    :color="scope.opt.token_used ? 'grey' : 'positive'"
                    text-color="white"
                    size="sm"
                  >
                    {{ scope.opt.token_used ? 'Claimed' : 'Available' }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-input v-model="deviceNickname" label="Nickname (optional)" outlined class="q-mt-md" />

          <q-checkbox v-model="isPrimary" label="Set as primary device" class="q-mt-sm" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Assign"
            color="secondary"
            @click="confirmAssignDevice"
            :loading="assigning"
            :disable="!selectedDevice"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { adminAPI } from '../services/api'

const $q = useQuasar()

// State
const users = ref([])
const userDevices = ref([])
const allDevices = ref([])
const availableDevices = ref([])
const loading = ref(false)
const assigning = ref(false)
const filter = ref('')
const statusFilter = ref('all')
const showDevicesDialog = ref(false)
const showAssignDialog = ref(false)
const selectedUser = ref(null)
const selectedDevice = ref(null)
const deviceNickname = ref('')
const isPrimary = ref(false)

const pagination = ref({
  rowsPerPage: 20,
})

// Options
const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Verified', value: 'verified' },
]

// Columns
const columns = [
  { name: 'email', label: 'User', field: 'email', align: 'left', sortable: true },
  { name: 'full_name', label: 'Full Name', field: 'full_name', align: 'left', sortable: true },
  { name: 'status', label: 'Status', align: 'center' },
  { name: 'devices', label: 'Devices', align: 'center' },
  { name: 'tier', label: 'Tier', align: 'center' },
  {
    name: 'created_at',
    label: 'Joined',
    field: 'created_at',
    align: 'left',
    format: val => new Date(val).toLocaleDateString('vi-VN'),
  },
  { name: 'actions', label: 'Actions', align: 'center' },
]

// Computed
const filteredUsers = computed(() => {
  let result = users.value

  // Filter by search
  if (filter.value) {
    const search = filter.value.toLowerCase()
    result = result.filter(
      u =>
        u.email.toLowerCase().includes(search) ||
        u.username.toLowerCase().includes(search) ||
        (u.full_name && u.full_name.toLowerCase().includes(search))
    )
  }

  // Filter by status
  if (statusFilter.value === 'active') {
    result = result.filter(u => u.is_active)
  } else if (statusFilter.value === 'inactive') {
    result = result.filter(u => !u.is_active)
  } else if (statusFilter.value === 'verified') {
    result = result.filter(u => u.is_verified)
  }

  return result
})

const totalDevices = computed(() => {
  return allDevices.value.filter(d => d.token_used).length
})

// Methods
async function fetchUsers() {
  try {
    loading.value = true
    const response = await adminAPI.get('/api/admin/users')
    users.value = response.data
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error loading users: ' + error.message,
    })
  } finally {
    loading.value = false
  }
}

async function fetchDevices() {
  try {
    const response = await adminAPI.get('/api/admin/devices')
    allDevices.value = response.data
  } catch (error) {
    console.error('Error loading devices:', error)
  }
}

async function showUserDevices(user) {
  selectedUser.value = user
  showDevicesDialog.value = true

  try {
    const response = await adminAPI.get(`/api/admin/users/${user.id}/devices`)
    userDevices.value = response.data
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error loading user devices: ' + error.message,
    })
  }
}

function assignDevice(user) {
  selectedUser.value = user
  selectedDevice.value = null
  deviceNickname.value = ''
  isPrimary.value = false
  availableDevices.value = allDevices.value.filter(d => !d.token_used)
  showAssignDialog.value = true
}

function assignDeviceFromDialog() {
  showDevicesDialog.value = false
  assignDevice(selectedUser.value)
}

async function confirmAssignDevice() {
  try {
    assigning.value = true
    await adminAPI.post(`/api/admin/users/${selectedUser.value.id}/devices`, {
      device_id: selectedDevice.value,
      nickname: deviceNickname.value,
      is_primary: isPrimary.value,
    })

    $q.notify({
      type: 'positive',
      message: 'Device assigned successfully',
    })

    showAssignDialog.value = false
    await fetchUsers()
    await fetchDevices()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error: ' + (error.response?.data?.detail || error.message),
    })
  } finally {
    assigning.value = false
  }
}

async function removeDeviceFromUser(device) {
  $q.dialog({
    title: 'Confirm',
    message: `Remove device "${device.device_id}" from user?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await adminAPI.delete(`/api/admin/users/${selectedUser.value.id}/devices/${device.id}`)
      $q.notify({
        type: 'positive',
        message: 'Device removed',
      })
      await showUserDevices(selectedUser.value)
      await fetchDevices()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error: ' + (error.response?.data?.detail || error.message),
      })
    }
  })
}

function getUserDeviceCount(userId) {
  // This would come from API in real implementation
  return allDevices.value.filter(d => d.owner_user_id === userId).length
}

function getUserTier(userId) {
  // Placeholder - would come from API
  return 'Basic'
}

function getDeviceLimit(userId) {
  const tier = getUserTier(userId)
  return tier === 'Basic' ? 1 : tier === 'Pro' ? 5 : -1
}

function getTierColor(tier) {
  switch (tier?.toLowerCase()) {
    case 'basic':
      return 'grey'
    case 'pro':
      return 'primary'
    case 'expert':
      return 'deep-purple'
    default:
      return 'grey'
  }
}

function filterDevices(val, update) {
  update(() => {
    const needle = val.toLowerCase()
    availableDevices.value = allDevices.value
      .filter(d => !d.token_used)
      .filter(
        d => d.device_id.toLowerCase().includes(needle) || d.name.toLowerCase().includes(needle)
      )
  })
}

function editUser(user) {
  $q.notify({
    type: 'info',
    message: 'Tier editing - Coming soon',
  })
}

onMounted(() => {
  fetchUsers()
  fetchDevices()
})
</script>

<style scoped>
.users-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-container {
  max-width: 1800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.modern-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
}
</style>
