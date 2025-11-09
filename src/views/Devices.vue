<template>
  <q-page class="devices-page">
    <div class="page-container q-pa-lg">
      <div class="page-header q-mb-xl">
        <div>
          <div class="text-h3 text-weight-bold text-grey-9 q-mb-xs">
            <q-icon name="devices" size="36px" class="q-mr-sm" color="primary" />
            Quản lý thiết bị
          </div>
          <div class="text-body1 text-grey-6">Danh sách và điều khiển thiết bị</div>
        </div>
        <q-space />
        <q-btn
          color="primary"
          icon="refresh"
          label="Làm mới"
          unelevated
          rounded
          @click="refresh"
          :loading="loading"
          class="refresh-btn"
          size="md"
        />
      </div>

      <q-card class="modern-card" flat>
        <q-table
          :rows="devices"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :filter="filter"
          @request="onRequest"
          :rows-per-page-options="[10, 20, 50]"
          class="devices-table"
        >
          <template v-slot:top>
            <div class="row full-width items-center q-gutter-md">
              <q-input
                v-model="filter"
                placeholder="Tìm kiếm thiết bị..."
                outlined
                dense
                clearable
                class="col-12 col-md-4"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-space />
              <div class="text-body2 text-grey-6">
                Tổng: <strong>{{ devices.length }}</strong> thiết bị
              </div>
            </div>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.online ? 'positive' : 'negative'"
                text-color="white"
                dense
                size="sm"
                :icon="props.row.online ? 'check_circle' : 'cancel'"
              >
                {{ props.row.online ? 'Online' : 'Offline' }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="row q-gutter-xs">
                <q-btn
                  flat
                  round
                  dense
                  icon="visibility"
                  color="primary"
                  :to="{ name: 'device-detail', params: { deviceId: props.row.device_id } }"
                  size="sm"
                >
                  <q-tooltip>Xem chi tiết</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="settings"
                  color="secondary"
                  @click="showControlDialog(props.row)"
                  size="sm"
                >
                  <q-tooltip>Điều khiển</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center text-grey-6 q-gutter-sm q-pa-lg">
              <q-icon name="devices_other" size="2em" />
              <span>Không có thiết bị nào</span>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Control Dialog -->
    <q-dialog v-model="showControl" v-if="selectedDevice" persistent>
      <q-card style="min-width: 450px" class="control-dialog">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6 text-weight-bold">Điều khiển thiết bị</div>
          <div class="text-caption text-grey-3 q-mt-xs">
            {{ selectedDevice.name || 'Unnamed Device' }} ({{ selectedDevice.device_id }})
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="text-subtitle2 text-grey-7 q-mb-md">Chọn các thiết bị cần điều khiển:</div>
          <div class="q-gutter-md">
            <q-card flat bordered class="control-item">
              <q-card-section class="row items-center">
                <q-icon name="water_drop" size="32px" color="blue" class="q-mr-md" />
                <div class="col">
                  <div class="text-weight-medium">Máy bơm (Pump)</div>
                  <div class="text-caption text-grey-6">Điều khiển hệ thống tưới nước</div>
                </div>
                <q-toggle v-model="controlCommand.pump" color="primary" size="lg" />
              </q-card-section>
            </q-card>

            <q-card flat bordered class="control-item">
              <q-card-section class="row items-center">
                <q-icon name="air" size="32px" color="cyan" class="q-mr-md" />
                <div class="col">
                  <div class="text-weight-medium">Quạt (Fan)</div>
                  <div class="text-caption text-grey-6">Điều khiển hệ thống thông gió</div>
                </div>
                <q-toggle v-model="controlCommand.fan" color="secondary" size="lg" />
              </q-card-section>
            </q-card>

            <q-card flat bordered class="control-item">
              <q-card-section class="row items-center">
                <q-icon name="lightbulb" size="32px" color="amber" class="q-mr-md" />
                <div class="col">
                  <div class="text-weight-medium">Đèn (Light)</div>
                  <div class="text-caption text-grey-6">Điều khiển hệ thống chiếu sáng</div>
                </div>
                <q-toggle v-model="controlCommand.light" color="accent" size="lg" />
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Hủy" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Gửi lệnh"
            color="primary"
            icon="send"
            @click="sendControlCommand"
            :loading="sending"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { adminAPI } from '../services/api'
import { useQuasar } from 'quasar'

const appStore = useAppStore()
const $q = useQuasar()

const { devices, loading } = appStore
const filter = ref('')
const showControl = ref(false)
const selectedDevice = ref(null)
const sending = ref(false)
const controlCommand = ref({
  pump: false,
  fan: false,
  light: false,
})

const columns = [
  { name: 'device_id', label: 'Device ID', field: 'device_id', align: 'left', sortable: true },
  { name: 'name', label: 'Tên', field: 'name', align: 'left', sortable: true },
  { name: 'status', label: 'Trạng thái', field: 'online', align: 'center' },
  {
    name: 'last_seen',
    label: 'Lần cuối',
    field: 'last_seen',
    align: 'left',
    format: val => new Date(val).toLocaleString('vi-VN'),
  },
  { name: 'actions', label: 'Thao tác', align: 'center' },
]

function onRequest(props) {
  // Table request handler
}

function refresh() {
  appStore.fetchDevices()
}

function showControlDialog(device) {
  selectedDevice.value = device
  controlCommand.value = { pump: false, fan: false, light: false }
  showControl.value = true
}

async function sendControlCommand() {
  try {
    sending.value = true
    await adminAPI.controlDevice(selectedDevice.value.device_id, controlCommand.value)
    $q.notify({
      type: 'positive',
      message: 'Lệnh điều khiển đã được gửi thành công',
      position: 'top',
      timeout: 2000,
    })
    showControl.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Lỗi khi gửi lệnh: ' + error.message,
      position: 'top',
    })
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  appStore.fetchDevices()
  appStore.initWebSocket()
})
</script>

<style scoped>
.devices-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.page-container {
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.refresh-btn {
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.modern-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.control-dialog .control-item {
  transition: all 0.2s ease;
}

.control-dialog .control-item:hover {
  background-color: rgba(25, 118, 210, 0.04);
}

.devices-table {
  background: white;
}

@media (max-width: 1023px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 599px) {
  .page-container {
    padding: 1rem !important;
  }

  .text-h3 {
    font-size: 1.75rem;
  }
}
</style>
