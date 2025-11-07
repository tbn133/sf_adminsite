<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h4">Pairing Requests</div>
      <q-space />
      <q-btn color="primary" icon="refresh" label="Refresh" @click="refresh" />
    </div>

    <q-table
      :rows="pairings"
      :columns="columns"
      row-key="id"
      :loading="loading"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            dense
            icon="check"
            color="positive"
            @click="approvePairing(props.row)"
          />
          <q-btn
            flat
            round
            dense
            icon="close"
            color="negative"
            @click="rejectPairing(props.row)"
          />
        </q-td>
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

    <!-- Approve Dialog -->
    <q-dialog v-model="showApproveDialog" v-if="selectedPairing">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Approve Pairing</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model.number="approveForm.max_devices" type="number" label="Max Devices" outlined class="q-mb-md" />
          <q-input v-model.number="approveForm.expires_days" type="number" label="License Expires (days, optional)" outlined />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Approve" color="positive" @click="confirmApprove" />
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
  expires_days: null
})

const columns = [
  { name: 'id', label: 'ID', field: 'id' },
  { name: 'app_id', label: 'App ID', field: 'app_id' },
  { name: 'app_name', label: 'App Name', field: 'app_name' },
  { name: 'app_version', label: 'Version', field: 'app_version' },
  { name: 'device_info', label: 'Device Info', field: 'device_info' },
  { name: 'created_at', label: 'Created', field: 'created_at', format: (val) => val ? new Date(val).toLocaleString('vi-VN') : 'N/A' },
  { name: 'actions', label: 'Actions', align: 'center' }
]

async function refresh() {
  try {
    loading.value = true
    const response = await adminAPI.get('/admin/pairings/pending')
    pairings.value = response.data || response
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error loading pairings: ' + (error.response?.data?.detail || error.message)
    })
  } finally {
    loading.value = false
  }
}

function approvePairing(pairing) {
  selectedPairing.value = pairing
  approveForm.value = {
    max_devices: 1,
    expires_days: null
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
        : 'Pairing approved successfully'
    })
    showApproveDialog.value = false
    await refresh()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error approving pairing: ' + (error.response?.data?.detail || error.message)
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
      label: 'Reason (optional)'
    }
  }).onOk(async (reason) => {
    try {
      const params = new URLSearchParams()
      if (reason) {
        params.append('reason', reason)
      }
      const url = `/admin/pairings/${pairing.id}/reject${params.toString() ? '?' + params.toString() : ''}`
      await adminAPI.post(url, {})
      $q.notify({
        type: 'positive',
        message: 'Pairing rejected'
      })
      await refresh()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error rejecting pairing: ' + (error.response?.data?.detail || error.message)
      })
    }
  })
}

onMounted(() => {
  refresh()
})
</script>

