<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h4">Quản lý thiết bị</div>
      <q-space />
      <q-btn color="primary" icon="refresh" label="Làm mới" @click="refresh" />
    </div>

    <q-table
      :rows="devices"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :filter="filter"
      @request="onRequest"
    >
      <template v-slot:top>
        <q-input
          v-model="filter"
          placeholder="Tìm kiếm thiết bị..."
          dense
          outlined
          class="q-mr-sm"
          style="min-width: 250px"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            :color="props.row.online ? 'positive' : 'negative'"
            text-color="white"
            dense
          >
            {{ props.row.online ? 'Online' : 'Offline' }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            dense
            icon="visibility"
            color="primary"
            :to="{ name: 'device-detail', params: { deviceId: props.row.device_id } }"
          />
          <q-btn
            flat
            round
            dense
            icon="settings"
            color="secondary"
            @click="showControlDialog(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Control Dialog -->
    <q-dialog v-model="showControl" v-if="selectedDevice">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Điều khiển thiết bị</div>
          <div class="text-caption">{{ selectedDevice.name }} ({{ selectedDevice.device_id }})</div>
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-md">
            <q-toggle
              v-model="controlCommand.pump"
              label="Pump"
              color="primary"
            />
            <q-toggle
              v-model="controlCommand.fan"
              label="Fan"
              color="secondary"
            />
            <q-toggle
              v-model="controlCommand.light"
              label="Light"
              color="accent"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Hủy" color="negative" v-close-popup />
          <q-btn flat label="Gửi lệnh" color="primary" @click="sendControlCommand" />
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
const controlCommand = ref({
  pump: false,
  fan: false,
  light: false
})

const columns = [
  { name: 'device_id', label: 'Device ID', field: 'device_id', align: 'left', sortable: true },
  { name: 'name', label: 'Tên', field: 'name', align: 'left', sortable: true },
  { name: 'status', label: 'Trạng thái', field: 'online', align: 'center' },
  { name: 'last_seen', label: 'Lần cuối', field: 'last_seen', align: 'left', format: (val) => new Date(val).toLocaleString('vi-VN') },
  { name: 'actions', label: 'Thao tác', align: 'center' }
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
    await adminAPI.controlDevice(selectedDevice.value.device_id, controlCommand.value)
    $q.notify({
      type: 'positive',
      message: 'Lệnh điều khiển đã được gửi thành công'
    })
    showControl.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Lỗi khi gửi lệnh: ' + error.message
    })
  }
}

onMounted(() => {
  appStore.fetchDevices()
  appStore.initWebSocket()
})
</script>

