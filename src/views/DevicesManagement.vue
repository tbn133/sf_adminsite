<template>
  <q-page class="devices-management-page">
    <div class="page-container q-pa-lg">
      <!-- Header -->
      <div class="page-header q-mb-xl">
        <div>
          <div class="text-h3 text-weight-bold text-grey-9 q-mb-xs">
            <q-icon name="inventory_2" size="36px" class="q-mr-sm" color="primary" />
            Quản lý Thiết bị (Device Management)
          </div>
          <div class="text-body1 text-grey-6">
            Pre-register devices, generate QR codes, and manage inventory
          </div>
        </div>
        <q-space />
        <div class="row q-gutter-sm">
          <q-btn
            color="secondary"
            icon="file_upload"
            label="Import CSV"
            unelevated
            rounded
            @click="showImportDialog = true"
            size="md"
          />
          <q-btn
            color="primary"
            icon="add"
            label="Thêm thiết bị"
            unelevated
            rounded
            @click="showAddDialog = true"
            size="md"
          />
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stat-card" flat>
            <q-card-section>
              <div class="text-grey-6 text-caption">Tổng thiết bị</div>
              <div class="text-h4 text-weight-bold text-primary">{{ stats.total }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stat-card" flat>
            <q-card-section>
              <div class="text-grey-6 text-caption">Chưa kích hoạt</div>
              <div class="text-h4 text-weight-bold text-orange">{{ stats.unclaimed }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stat-card" flat>
            <q-card-section>
              <div class="text-grey-6 text-caption">Đã kích hoạt</div>
              <div class="text-h4 text-weight-bold text-positive">{{ stats.claimed }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stat-card" flat>
            <q-card-section>
              <div class="text-grey-6 text-caption">Online</div>
              <div class="text-h4 text-weight-bold text-teal">{{ stats.online }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Filters -->
      <q-card class="modern-card q-mb-md" flat>
        <q-card-section>
          <div class="row q-col-gutter-md items-center">
            <div class="col-12 col-md-4">
              <q-input
                v-model="filter"
                placeholder="Tìm kiếm Device ID hoặc tên..."
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
                label="Trạng thái"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="claimFilter"
                :options="claimOptions"
                label="Kích hoạt"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-2">
              <q-btn
                color="primary"
                icon="refresh"
                label="Làm mới"
                unelevated
                @click="fetchDevices"
                :loading="loading"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Table -->
      <q-card class="modern-card" flat>
        <q-table
          :rows="filteredDevices"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="pagination"
          class="devices-table"
        >
          <template v-slot:body-cell-pairing_status="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.token_used ? 'positive' : 'warning'"
                text-color="white"
                dense
                size="sm"
                :icon="props.row.token_used ? 'check_circle' : 'pending'"
              >
                {{ props.row.token_used ? 'Đã kích hoạt' : 'Chưa kích hoạt' }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-owner="props">
            <q-td :props="props">
              <div v-if="props.row.owner_email">
                <div class="text-weight-medium">{{ props.row.owner_email }}</div>
                <div class="text-caption text-grey-6">ID: {{ props.row.owner_user_id }}</div>
              </div>
              <div v-else class="text-grey-5">-</div>
            </q-td>
          </template>

          <template v-slot:body-cell-online="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.online ? 'positive' : 'grey'"
                text-color="white"
                dense
                size="sm"
                :icon="props.row.online ? 'wifi' : 'wifi_off'"
              >
                {{ props.row.online ? 'Online' : 'Offline' }}
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
                  icon="qr_code"
                  color="primary"
                  @click="showQRCode(props.row)"
                  size="sm"
                  :disable="props.row.token_used"
                >
                  <q-tooltip>{{ props.row.token_used ? 'Đã sử dụng' : 'Xem QR Code' }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="download"
                  color="secondary"
                  @click="downloadQR(props.row)"
                  size="sm"
                  :disable="props.row.token_used"
                >
                  <q-tooltip>Download QR</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="info"
                  @click="editDevice(props.row)"
                  size="sm"
                >
                  <q-tooltip>Sửa</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  @click="deleteDevice(props.row)"
                  size="sm"
                >
                  <q-tooltip>Xóa</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template v-slot:bottom>
            <div class="row full-width items-center justify-between q-pa-sm">
              <div class="text-grey-7">
                Hiển thị {{ filteredDevices.length }} / {{ devices.length }} thiết bị
              </div>
              <q-btn
                color="accent"
                icon="download"
                label="Download All QR (ZIP)"
                unelevated
                @click="downloadAllQR"
                :disable="unclaimedDevices.length === 0"
              />
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Add Device Dialog -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Thêm thiết bị mới</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="newDevice.device_id" label="Device ID *" outlined required />
          <q-input v-model="newDevice.name" label="Tên thiết bị *" outlined required />
          <q-input v-model="newDevice.notes" label="Ghi chú" outlined type="textarea" rows="3" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Hủy" color="grey-7" v-close-popup />
          <q-btn unelevated label="Tạo" color="primary" @click="createDevice" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- QR Code Dialog -->
    <q-dialog v-model="showQRDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">QR Code - {{ selectedDevice?.device_id }}</div>
          <div class="text-caption">{{ selectedDevice?.name }}</div>
        </q-card-section>

        <q-card-section class="text-center">
          <div v-if="qrData" id="qrcode" ref="qrContainer"></div>
          <div v-else class="text-grey-6">Đang tạo QR code...</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Đóng" color="grey-7" v-close-popup />
          <q-btn unelevated label="Download PNG" color="primary" @click="downloadCurrentQR" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Import Dialog -->
    <q-dialog v-model="showImportDialog">
      <q-card style="min-width: 500px">
        <q-card-section class="bg-secondary text-white">
          <div class="text-h6">Import thiết bị từ CSV</div>
        </q-card-section>

        <q-card-section>
          <div class="text-body2 q-mb-md">
            Upload file CSV với định dạng: <code>device_id,name,notes</code>
          </div>
          <q-file
            v-model="csvFile"
            label="Chọn file CSV"
            outlined
            accept=".csv"
            @update:model-value="onFileSelected"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Hủy" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Import"
            color="secondary"
            @click="importCSV"
            :loading="importing"
            :disable="!csvFile"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { adminAPI } from '../services/api'
import QRCode from 'qrcode'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const $q = useQuasar()

// State
const devices = ref([])
const loading = ref(false)
const saving = ref(false)
const importing = ref(false)
const filter = ref('')
const statusFilter = ref('all')
const claimFilter = ref('all')
const showAddDialog = ref(false)
const showQRDialog = ref(false)
const showImportDialog = ref(false)
const selectedDevice = ref(null)
const qrData = ref(null)
const qrContainer = ref(null)
const csvFile = ref(null)

const newDevice = ref({
  device_id: '',
  name: '',
  notes: '',
})

const pagination = ref({
  rowsPerPage: 20,
})

// Options
const statusOptions = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Online', value: 'online' },
  { label: 'Offline', value: 'offline' },
]

const claimOptions = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đã kích hoạt', value: 'claimed' },
  { label: 'Chưa kích hoạt', value: 'unclaimed' },
]

// Columns
const columns = [
  {
    name: 'device_id',
    label: 'Device ID',
    field: 'device_id',
    align: 'left',
    sortable: true,
  },
  { name: 'name', label: 'Tên', field: 'name', align: 'left', sortable: true },
  { name: 'pairing_status', label: 'Trạng thái Pairing', align: 'center' },
  { name: 'owner', label: 'Chủ sở hữu', align: 'left' },
  { name: 'online', label: 'Kết nối', align: 'center' },
  {
    name: 'created_at',
    label: 'Ngày tạo',
    field: 'created_at',
    align: 'left',
    format: val => new Date(val).toLocaleDateString('vi-VN'),
  },
  { name: 'actions', label: 'Thao tác', align: 'center' },
]

// Computed
const stats = computed(() => ({
  total: devices.value.length,
  unclaimed: devices.value.filter(d => !d.token_used).length,
  claimed: devices.value.filter(d => d.token_used).length,
  online: devices.value.filter(d => d.online).length,
}))

const filteredDevices = computed(() => {
  let result = devices.value

  // Filter by search
  if (filter.value) {
    const search = filter.value.toLowerCase()
    result = result.filter(
      d => d.device_id.toLowerCase().includes(search) || d.name.toLowerCase().includes(search)
    )
  }

  // Filter by status
  if (statusFilter.value === 'online') {
    result = result.filter(d => d.online)
  } else if (statusFilter.value === 'offline') {
    result = result.filter(d => !d.online)
  }

  // Filter by claim status
  if (claimFilter.value === 'claimed') {
    result = result.filter(d => d.token_used)
  } else if (claimFilter.value === 'unclaimed') {
    result = result.filter(d => !d.token_used)
  }

  return result
})

const unclaimedDevices = computed(() => devices.value.filter(d => !d.token_used))

// Methods
async function fetchDevices() {
  try {
    loading.value = true
    const response = await adminAPI.get('/api/admin/devices')
    devices.value = response.data
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Lỗi khi tải danh sách thiết bị: ' + error.message,
    })
  } finally {
    loading.value = false
  }
}

async function createDevice() {
  if (!newDevice.value.device_id || !newDevice.value.name) {
    $q.notify({
      type: 'warning',
      message: 'Vui lòng điền đầy đủ thông tin',
    })
    return
  }

  try {
    saving.value = true
    await adminAPI.post('/api/admin/devices/pre-register', newDevice.value)
    $q.notify({
      type: 'positive',
      message: 'Thiết bị đã được tạo thành công',
    })
    showAddDialog.value = false
    newDevice.value = { device_id: '', name: '', notes: '' }
    await fetchDevices()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Lỗi: ' + (error.response?.data?.detail || error.message),
    })
  } finally {
    saving.value = false
  }
}

async function showQRCode(device) {
  selectedDevice.value = device
  showQRDialog.value = true

  try {
    const response = await adminAPI.get(`/api/admin/devices/${device.id}/pairing-token`)
    qrData.value = response.data.qr_data

    await nextTick()
    const container = document.getElementById('qrcode')
    if (container) {
      container.innerHTML = ''
      await QRCode.toCanvas(qrData.value, {
        errorCorrectionLevel: 'H',
        width: 300,
        margin: 2,
      }).then(canvas => {
        container.appendChild(canvas)
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Lỗi khi tạo QR code: ' + error.message,
    })
  }
}

async function downloadQR(device) {
  try {
    const response = await adminAPI.get(`/api/admin/devices/${device.id}/pairing-token`)
    const qrDataURL = await QRCode.toDataURL(response.data.qr_data, {
      errorCorrectionLevel: 'H',
      width: 512,
      margin: 2,
    })

    const link = document.createElement('a')
    link.download = `QR_${device.device_id}.png`
    link.href = qrDataURL
    link.click()

    $q.notify({
      type: 'positive',
      message: 'QR code đã được tải xuống',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Lỗi khi tải QR code: ' + error.message,
    })
  }
}

function downloadCurrentQR() {
  const canvas = document.querySelector('#qrcode canvas')
  if (canvas) {
    canvas.toBlob(blob => {
      saveAs(blob, `QR_${selectedDevice.value.device_id}.png`)
    })
  }
}

async function downloadAllQR() {
  try {
    $q.loading.show({ message: 'Đang tạo file ZIP...' })

    const zip = new JSZip()
    const promises = []

    for (const device of unclaimedDevices.value) {
      const promise = (async () => {
        const response = await adminAPI.get(`/api/admin/devices/${device.id}/pairing-token`)
        const qrDataURL = await QRCode.toDataURL(response.data.qr_data, {
          errorCorrectionLevel: 'H',
          width: 512,
          margin: 2,
        })
        const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '')
        zip.file(`${device.device_id}.png`, base64Data, { base64: true })
      })()
      promises.push(promise)
    }

    await Promise.all(promises)
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `QR_Codes_${new Date().toISOString().split('T')[0]}.zip`)

    $q.notify({
      type: 'positive',
      message: `Đã tải xuống ${unclaimedDevices.value.length} QR codes`,
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Lỗi khi tạo ZIP: ' + error.message,
    })
  } finally {
    $q.loading.hide()
  }
}

async function deleteDevice(device) {
  const isClaimed = device.token_used || device.claimed_by
  const message = isClaimed
    ? `Thiết bị "${device.device_id}" đã được kích hoạt. Xóa sẽ hủy liên kết với người dùng và xóa toàn bộ dữ liệu. Tiếp tục?`
    : `Bạn có chắc muốn xóa thiết bị "${device.device_id}"?`

  $q.dialog({
    title: 'Xác nhận xóa',
    message,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await adminAPI.delete(`/api/admin/devices/${device.id}`)
      $q.notify({
        type: 'positive',
        message: 'Thiết bị đã được xóa',
      })
      await fetchDevices()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Lỗi: ' + (error.response?.data?.detail || error.message),
      })
    }
  })
}

function editDevice(device) {
  // TODO: Implement edit dialog
  $q.notify({
    type: 'info',
    message: 'Chức năng đang phát triển',
  })
}

function onFileSelected(file) {
  csvFile.value = file
}

async function importCSV() {
  // TODO: Implement CSV import
  $q.notify({
    type: 'info',
    message: 'Chức năng import CSV đang phát triển',
  })
}

onMounted(() => {
  fetchDevices()
})
</script>

<style scoped>
.devices-management-page {
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

code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}
</style>
