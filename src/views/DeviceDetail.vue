<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" @click="$router.back()" size="md" />
      <div class="q-ml-sm">
        <div class="text-h4 text-weight-bold text-grey-9 q-mb-xs">
          {{ device?.name || deviceId }}
        </div>
        <div class="text-body2 text-grey-6">{{ deviceId }}</div>
      </div>
      <q-space />
      <q-btn
        color="primary"
        icon="refresh"
        label="Làm mới"
        unelevated
        @click="refresh"
        :loading="loadingLogs || loadingControlHistory"
      />
    </div>

    <q-tabs
      v-model="tab"
      class="q-mb-md"
      active-color="primary"
      indicator-color="primary"
      align="left"
      narrow-indicator
    >
      <q-tab name="overview" label="Tổng quan" icon="dashboard" />
      <q-tab name="logs" label="Logs" icon="history" />
      <q-tab name="control" label="Điều khiển" icon="settings" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <!-- Overview Tab -->
      <q-tab-panel name="overview">
        <div class="row q-gutter-md q-mb-md">
          <q-card class="col-12 col-md-6" flat bordered>
            <q-card-section class="bg-primary text-white">
              <div class="text-h6 text-weight-bold">Thông tin thiết bị</div>
            </q-card-section>
            <q-card-section v-if="device" class="q-pa-lg">
              <div class="q-gutter-md">
                <div class="row items-center">
                  <q-icon name="fingerprint" size="24px" color="primary" class="q-mr-md" />
                  <div class="col">
                    <div class="text-caption text-grey-6">Device ID</div>
                    <div class="text-body1 text-weight-medium">{{ device.device_id }}</div>
                  </div>
                </div>
                <q-separator />
                <div class="row items-center">
                  <q-icon name="label" size="24px" color="primary" class="q-mr-md" />
                  <div class="col">
                    <div class="text-caption text-grey-6">Tên thiết bị</div>
                    <div class="text-body1 text-weight-medium">
                      {{ device.name || 'Unnamed Device' }}
                    </div>
                  </div>
                </div>
                <q-separator />
                <div class="row items-center">
                  <q-icon name="network_check" size="24px" color="primary" class="q-mr-md" />
                  <div class="col">
                    <div class="text-caption text-grey-6">Trạng thái</div>
                    <q-chip
                      :color="device.online ? 'positive' : 'negative'"
                      text-color="white"
                      dense
                      :icon="device.online ? 'check_circle' : 'cancel'"
                    >
                      {{ device.online ? 'Online' : 'Offline' }}
                    </q-chip>
                  </div>
                </div>
                <q-separator />
                <div class="row items-center">
                  <q-icon name="schedule" size="24px" color="primary" class="q-mr-md" />
                  <div class="col">
                    <div class="text-caption text-grey-6">Lần cuối hoạt động</div>
                    <div class="text-body1 text-weight-medium">
                      {{ formatDate(device.last_seen) }}
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="col-12 col-md-6" flat bordered>
            <q-card-section class="bg-green text-white">
              <div class="text-h6 text-weight-bold">Dữ liệu cảm biến mới nhất</div>
            </q-card-section>
            <q-card-section v-if="latestSensorData" class="q-pa-lg">
              <div class="row q-gutter-md">
                <div class="col-6">
                  <q-card flat class="bg-blue-1">
                    <q-card-section class="text-center">
                      <q-icon name="thermostat" size="32px" color="blue" class="q-mb-xs" />
                      <div class="text-h6 text-weight-bold text-blue-9">
                        {{ latestSensorData.temperature || 'N/A' }}°C
                      </div>
                      <div class="text-caption text-grey-7">Nhiệt độ</div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-6">
                  <q-card flat class="bg-cyan-1">
                    <q-card-section class="text-center">
                      <q-icon name="water_drop" size="32px" color="cyan" class="q-mb-xs" />
                      <div class="text-h6 text-weight-bold text-cyan-9">
                        {{ latestSensorData.humidity || 'N/A' }}%
                      </div>
                      <div class="text-caption text-grey-7">Độ ẩm</div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- VPD Card -->
                <div
                  class="col-6"
                  v-if="latestSensorData.vpd !== null && latestSensorData.vpd !== undefined"
                >
                  <q-card flat :class="getVPDCardClass(latestSensorData.vpd)">
                    <q-card-section class="text-center">
                      <q-icon
                        name="air"
                        size="32px"
                        :color="getVPDColor(latestSensorData.vpd)"
                        class="q-mb-xs"
                      />
                      <div
                        class="text-h6 text-weight-bold"
                        :class="`text-${getVPDColor(latestSensorData.vpd)}-9`"
                      >
                        {{ formatVPD(latestSensorData.vpd) }} kPa
                      </div>
                      <div class="text-caption text-grey-7">
                        VPD
                        <q-tooltip class="bg-grey-9 text-body2" max-width="300px">
                          <div class="text-weight-bold q-mb-xs">Vapor Pressure Deficit</div>
                          <div>{{ getVPDStatus(latestSensorData.vpd) }}</div>
                          <div class="q-mt-xs text-grey-4">Optimal: 0.8-1.2 kPa</div>
                        </q-tooltip>
                      </div>
                      <q-badge
                        :color="getVPDColor(latestSensorData.vpd)"
                        :label="getVPDLabel(latestSensorData.vpd)"
                        class="q-mt-xs"
                      />
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-6">
                  <q-card flat class="bg-brown-1">
                    <q-card-section class="text-center">
                      <q-icon name="grass" size="32px" color="brown" class="q-mb-xs" />
                      <div class="text-h6 text-weight-bold text-brown-9">
                        {{ latestSensorData.soil_moisture || 'N/A' }}%
                      </div>
                      <div class="text-caption text-grey-7">Độ ẩm đất</div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-6">
                  <q-card flat class="bg-amber-1">
                    <q-card-section class="text-center">
                      <q-icon name="lightbulb" size="32px" color="amber" class="q-mb-xs" />
                      <div class="text-h6 text-weight-bold text-amber-9">
                        {{ latestSensorData.light_intensity || 'N/A' }} lux
                      </div>
                      <div class="text-caption text-grey-7">Ánh sáng</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
              <div class="text-caption text-grey-6 q-mt-md text-center">
                <q-icon name="update" size="16px" class="q-mr-xs" />
                Cập nhật: {{ formatDate(latestSensorData.timestamp) }}
              </div>
            </q-card-section>
            <q-card-section v-else class="text-center text-grey-6 q-pa-lg">
              <q-icon name="sensors_off" size="48px" class="q-mb-sm" />
              <div>Chưa có dữ liệu cảm biến</div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- Logs Tab -->
      <q-tab-panel name="logs">
        <q-card flat bordered>
          <q-card-section class="bg-grey-2">
            <div class="text-h6 text-weight-bold text-grey-9">Lịch sử cảm biến</div>
          </q-card-section>
          <q-card-section>
            <q-table
              :rows="logs.sensor_logs"
              :columns="logColumns"
              row-key="id"
              :loading="loadingLogs"
              :pagination="{ rowsPerPage: 20 }"
              flat
            />
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- Control Tab -->
      <q-tab-panel name="control">
        <div class="row q-gutter-md">
          <q-card class="col-12 col-md-6" flat bordered>
            <q-card-section class="bg-primary text-white">
              <div class="text-h6 text-weight-bold">Điều khiển thiết bị</div>
            </q-card-section>
            <q-card-section class="q-pa-lg">
              <div class="q-gutter-md">
                <q-card flat bordered class="control-item">
                  <q-card-section class="row items-center">
                    <q-icon name="water_drop" size="32px" color="blue" class="q-mr-md" />
                    <div class="col">
                      <div class="text-weight-medium">Máy bơm (Pump)</div>
                      <div class="text-caption text-grey-6">Hệ thống tưới nước</div>
                    </div>
                    <q-toggle v-model="controlCommand.pump" color="primary" size="lg" />
                  </q-card-section>
                </q-card>

                <q-card flat bordered class="control-item">
                  <q-card-section class="row items-center">
                    <q-icon name="air" size="32px" color="cyan" class="q-mr-md" />
                    <div class="col">
                      <div class="text-weight-medium">Quạt (Fan)</div>
                      <div class="text-caption text-grey-6">Hệ thống thông gió</div>
                    </div>
                    <q-toggle v-model="controlCommand.fan" color="secondary" size="lg" />
                  </q-card-section>
                </q-card>

                <q-card flat bordered class="control-item">
                  <q-card-section class="row items-center">
                    <q-icon name="lightbulb" size="32px" color="amber" class="q-mr-md" />
                    <div class="col">
                      <div class="text-weight-medium">Đèn (Light)</div>
                      <div class="text-caption text-grey-6">Hệ thống chiếu sáng</div>
                    </div>
                    <q-toggle v-model="controlCommand.light" color="accent" size="lg" />
                  </q-card-section>
                </q-card>
              </div>
            </q-card-section>
            <q-card-actions align="right" class="q-pa-md">
              <q-btn flat label="Reset" color="grey-7" @click="resetDevice" />
              <q-btn
                unelevated
                color="primary"
                label="Gửi lệnh"
                icon="send"
                @click="sendControl"
                :loading="sending"
              />
            </q-card-actions>
          </q-card>

          <q-card class="col-12 col-md-6" flat bordered>
            <q-card-section class="bg-grey-2">
              <div class="text-h6 text-weight-bold text-grey-9">Lịch sử điều khiển</div>
            </q-card-section>
            <q-card-section>
              <q-table
                :rows="controlHistory"
                :columns="controlHistoryColumns"
                row-key="id"
                :loading="loadingControlHistory"
                flat
                :pagination="{ rowsPerPage: 10 }"
              />
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { adminAPI, sensorsAPI, controlAPI } from '../services/api'
import { useQuasar } from 'quasar'
import { format } from 'date-fns'

const route = useRoute()
const $q = useQuasar()

const deviceId = computed(() => route.params.deviceId)
const tab = ref('overview')
const device = ref(null)
const latestSensorData = ref(null)
const logs = ref({ sensor_logs: [], control_logs: [] })
const controlHistory = ref([])
const loadingLogs = ref(false)
const loadingControlHistory = ref(false)
const sending = ref(false)
const controlCommand = ref({
  pump: false,
  fan: false,
  light: false,
})

const logColumns = [
  {
    name: 'timestamp',
    label: 'Thời gian',
    field: 'timestamp',
    format: val => (val ? format(new Date(val), 'dd/MM/yyyy HH:mm:ss') : 'N/A'),
  },
  {
    name: 'temperature',
    label: 'Nhiệt độ',
    field: 'temperature',
    format: val => (val !== null && val !== undefined ? `${val.toFixed(1)}°C` : 'N/A'),
  },
  {
    name: 'humidity',
    label: 'Độ ẩm',
    field: 'humidity',
    format: val => (val !== null && val !== undefined ? `${val.toFixed(1)}%` : 'N/A'),
  },
  {
    name: 'vpd',
    label: 'VPD',
    field: 'vpd',
    format: val => (val !== null && val !== undefined ? `${val.toFixed(2)} kPa` : 'N/A'),
  },
  {
    name: 'soil_moisture',
    label: 'Độ ẩm đất',
    field: 'soil_moisture',
    format: val => (val !== null && val !== undefined ? `${val.toFixed(1)}%` : 'N/A'),
  },
  {
    name: 'light_intensity',
    label: 'Ánh sáng',
    field: 'light_intensity',
    format: val => (val !== null && val !== undefined ? `${val.toFixed(0)} lux` : 'N/A'),
  },
]

const controlHistoryColumns = [
  {
    name: 'timestamp',
    label: 'Thời gian',
    field: 'timestamp',
    format: val => (val ? format(new Date(val), 'dd/MM/yyyy HH:mm:ss') : 'N/A'),
  },
  { name: 'pump', label: 'Pump', field: 'pump', format: val => (val ? 'ON' : 'OFF') },
  { name: 'fan', label: 'Fan', field: 'fan', format: val => (val ? 'ON' : 'OFF') },
  { name: 'light', label: 'Light', field: 'light', format: val => (val ? 'ON' : 'OFF') },
  { name: 'source', label: 'Nguồn', field: 'source' },
]

function formatDate(date) {
  if (!date) return 'N/A'
  return format(new Date(date), 'dd/MM/yyyy HH:mm:ss')
}

async function refresh() {
  await Promise.all([fetchDeviceInfo(), fetchLatestSensor(), fetchLogs(), fetchControlHistory()])
}

async function fetchDeviceInfo() {
  try {
    const response = await adminAPI.getDevices()
    device.value = response.data.find(d => d.device_id === deviceId.value)
  } catch (error) {
    console.error('Error fetching device:', error)
  }
}

async function fetchLatestSensor() {
  try {
    const response = await sensorsAPI.getLatest(deviceId.value)
    latestSensorData.value = response.data
  } catch (error) {
    console.error('Error fetching sensor data:', error)
  }
}

async function fetchLogs() {
  try {
    loadingLogs.value = true
    const response = await adminAPI.getDeviceLogs(deviceId.value, 7)
    logs.value = response.data
  } catch (error) {
    console.error('Error fetching logs:', error)
  } finally {
    loadingLogs.value = false
  }
}

async function fetchControlHistory() {
  try {
    loadingControlHistory.value = true
    const response = await controlAPI.getHistory(deviceId.value)
    controlHistory.value = response.data
  } catch (error) {
    console.error('Error fetching control history:', error)
  } finally {
    loadingControlHistory.value = false
  }
}

async function sendControl() {
  try {
    sending.value = true
    await adminAPI.controlDevice(deviceId.value, controlCommand.value)
    $q.notify({
      type: 'positive',
      message: 'Lệnh điều khiển đã được gửi thành công',
      position: 'top',
      timeout: 2000,
    })
    await fetchControlHistory()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Lỗi: ' + error.message,
      position: 'top',
    })
  } finally {
    sending.value = false
  }
}

async function resetDevice() {
  try {
    await adminAPI.resetDevice(deviceId.value)
    $q.notify({
      type: 'positive',
      message: 'Lệnh reset đã được gửi',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Lỗi: ' + error.message,
    })
  }
}

// VPD Helper Functions
function formatVPD(vpd) {
  if (vpd === null || vpd === undefined) return 'N/A'
  return Number(vpd).toFixed(2)
}

function getVPDColor(vpd) {
  if (vpd < 0.4) return 'blue'
  if (vpd < 0.8) return 'light-green'
  if (vpd < 1.2) return 'green'
  if (vpd < 1.5) return 'amber'
  if (vpd < 1.8) return 'orange'
  return 'red'
}

function getVPDCardClass(vpd) {
  const color = getVPDColor(vpd)
  return `bg-${color}-1`
}

function getVPDLabel(vpd) {
  if (vpd < 0.4) return 'Quá thấp'
  if (vpd < 0.8) return 'Thấp'
  if (vpd < 1.2) return 'Tối ưu'
  if (vpd < 1.5) return 'Cao'
  if (vpd < 1.8) return 'Quá cao'
  return 'Nguy hiểm'
}

function getVPDStatus(vpd) {
  if (vpd < 0.4) return 'VPD quá thấp - Nguy cơ nấm mốc, bệnh lá. Tăng nhiệt độ hoặc giảm độ ẩm.'
  if (vpd < 0.8) return 'VPD thấp - Tốt cho cây con và giâm cành. Thoát hơi nước chậm.'
  if (vpd < 1.2) return 'VPD tối ưu - Tăng trưởng mạnh, hấp thu dinh dưỡng tốt nhất.'
  if (vpd < 1.5) return 'VPD cao - Tốt cho giai đoạn cuối. Thoát hơi nước nhanh.'
  if (vpd < 1.8) return 'VPD quá cao - Nguy cơ stress, cháy lá. Giảm nhiệt độ hoặc tăng độ ẩm.'
  return 'VPD nguy hiểm - Cây đang bị stress nặng! Điều chỉnh ngay.'
}

onMounted(() => {
  refresh()
})
</script>

<style scoped>
.control-item {
  transition: all 0.2s ease;
}

.control-item:hover {
  background-color: rgba(25, 118, 210, 0.04);
}
</style>
