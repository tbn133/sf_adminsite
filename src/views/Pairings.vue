<template>
  <q-page class="pairings-page">
    <div class="page-container q-pa-lg">
      <div class="page-header q-mb-xl">
        <div>
          <div class="text-h3 text-weight-bold text-grey-9 q-mb-xs">
            <q-icon name="sync" size="36px" class="q-mr-sm" color="primary" />
            Pairing Requests
          </div>
          <div class="text-body1 text-grey-6">Quản lý yêu cầu kết nối thiết bị</div>
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
          size="md"
          class="refresh-btn"
        />
      </div>

      <q-card class="modern-card" flat>
        <q-table
          :rows="pairings"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :rows-per-page-options="[10, 20, 50]"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="row q-gutter-xs">
                <q-btn
                  flat
                  round
                  dense
                  icon="check"
                  color="positive"
                  size="sm"
                  @click="approvePairing(props.row)"
                >
                  <q-tooltip>Chấp nhận</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="close"
                  color="negative"
                  size="sm"
                  @click="rejectPairing(props.row)"
                >
                  <q-tooltip>Từ chối</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center text-grey-6 q-gutter-sm q-pa-lg">
              <q-icon name="link_off" size="2em" />
              <span>Không có yêu cầu nào</span>
            </div>
          </template>

          <template v-slot:body-cell-device_info="props">
            <q-td :props="props">
              <div v-if="props.row.device_info">
                <div>{{ props.row.device_info.platform }} {{ props.row.device_info.version }}</div>
                <div class="text-caption">{{ props.row.device_info.model }}</div>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Approve Dialog -->
    <q-dialog v-model="showApproveDialog" v-if="selectedPairing" persistent>
      <q-card style="min-width: 450px" class="pairing-dialog">
        <q-card-section class="bg-positive text-white">
          <div class="text-h6 text-weight-bold">Chấp nhận Pairing</div>
          <div class="text-caption text-grey-3 q-mt-xs">
            {{ selectedPairing.app_name }} ({{ selectedPairing.app_id }})
          </div>
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <div class="q-gutter-md">
            <q-input
              v-model.number="approveForm.max_devices"
              type="number"
              label="Số thiết bị tối đa"
              outlined
              dense
              :rules="[val => val > 0 || 'Vui lòng nhập số lớn hơn 0']"
            >
              <template v-slot:prepend>
                <q-icon name="devices" />
              </template>
            </q-input>
            <q-input
              v-model.number="approveForm.expires_days"
              type="number"
              label="Thời hạn license (ngày)"
              outlined
              dense
              hint="Để trống nếu không giới hạn"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-input>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Hủy" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Chấp nhận"
            color="positive"
            icon="check"
            @click="confirmApprove"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminAPI } from '../services/api'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const pairings = ref([])
const loading = ref(false)
const showApproveDialog = ref(false)
const selectedPairing = ref(null)
const approveForm = ref({
  max_devices: 1,
  expires_days: null,
})

const columns = [
  { name: 'id', label: 'ID', field: 'id' },
  { name: 'app_id', label: 'App ID', field: 'app_id' },
  { name: 'app_name', label: 'App Name', field: 'app_name' },
  { name: 'app_version', label: 'Version', field: 'app_version' },
  { name: 'device_info', label: 'Device Info', field: 'device_info' },
  {
    name: 'created_at',
    label: 'Created',
    field: 'created_at',
    format: val => (val ? new Date(val).toLocaleString('vi-VN') : 'N/A'),
  },
  { name: 'actions', label: 'Actions', align: 'center' },
]

async function refresh() {
  try {
    loading.value = true
    const response = await adminAPI.get('/admin/pairings/pending')
    pairings.value = response.data || response
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error loading pairings: ' + (error.response?.data?.detail || error.message),
    })
  } finally {
    loading.value = false
  }
}

function approvePairing(pairing) {
  selectedPairing.value = pairing
  approveForm.value = {
    max_devices: 1,
    expires_days: null,
  }
  showApproveDialog.value = true
}

async function confirmApprove() {
  try {
    // Build query params
    const params = new URLSearchParams()
    params.append('approved_by', 'admin')
    params.append('max_devices', approveForm.value.max_devices.toString())
    if (approveForm.value.expires_days) {
      params.append('expires_days', approveForm.value.expires_days.toString())
    }

    const response = await adminAPI.post(
      `/admin/pairings/${selectedPairing.value.id}/approve?${params.toString()}`,
      {}
    )
    const licenseKey = response.data?.license_key || response.license_key
    $q.notify({
      type: 'positive',
      message: licenseKey
        ? `Pairing approved! License: ${licenseKey.substring(0, 20)}...`
        : 'Pairing approved successfully',
    })
    showApproveDialog.value = false
    await refresh()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error approving pairing: ' + (error.response?.data?.detail || error.message),
    })
  }
}

async function rejectPairing(pairing) {
  $q.dialog({
    title: 'Reject Pairing',
    message: 'Are you sure you want to reject this pairing request?',
    cancel: true,
    persistent: true,
    prompt: {
      model: '',
      type: 'text',
      label: 'Reason (optional)',
    },
  }).onOk(async reason => {
    try {
      const params = new URLSearchParams()
      if (reason) {
        params.append('reason', reason)
      }
      const url = `/admin/pairings/${pairing.id}/reject${params.toString() ? '?' + params.toString() : ''}`
      await adminAPI.post(url, {})
      $q.notify({
        type: 'positive',
        message: 'Pairing rejected',
      })
      await refresh()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error rejecting pairing: ' + (error.response?.data?.detail || error.message),
      })
    }
  })
}

onMounted(() => {
  refresh()
})
</script>

<style scoped>
.pairings-page {
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

.pairing-dialog {
  border-radius: 16px;
  overflow: hidden;
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
