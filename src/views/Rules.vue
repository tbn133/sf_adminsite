<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h4">Quản lý Rules</div>
      <q-space />
      <q-btn color="primary" icon="add" label="Tạo rule" @click="showCreateDialog = true" />
    </div>

    <q-table
      :rows="rules"
      :columns="columns"
      row-key="id"
      :loading="loading"
    >
      <template v-slot:body-cell-enabled="props">
        <q-td :props="props">
          <q-toggle
            :model-value="props.row.enabled"
            @update:model-value="toggleRule(props.row)"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round dense icon="edit" color="primary" @click="editRule(props.row)" />
          <q-btn flat round dense icon="delete" color="negative" @click="deleteRule(props.row.id)" />
        </q-td>
      </template>
    </q-table>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showCreateDialog">
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">{{ editingRule ? 'Chỉnh sửa' : 'Tạo mới' }} rule</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="ruleForm.device_id"
            :options="deviceOptions"
            label="Thiết bị"
            outlined
            class="q-mb-md"
          />
          <q-input v-model="ruleForm.name" label="Tên rule" outlined class="q-mb-md" />
          <div class="text-caption">Condition và Action sẽ cần form phức tạp hơn</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Hủy" v-close-popup />
          <q-btn flat label="Lưu" color="primary" @click="saveRule" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '../stores/app'
import { rulesAPI } from '../services/api'
import { useQuasar } from 'quasar'

const appStore = useAppStore()
const $q = useQuasar()

const { rules, loading, devices } = appStore
const showCreateDialog = ref(false)
const editingRule = ref(null)
const ruleForm = ref({
  device_id: '',
  name: '',
  condition: { logic: 'AND', conditions: [] },
  action: { pump: false, fan: false, light: false },
  enabled: true
})

const deviceOptions = computed(() => 
  devices.map(d => ({ label: d.name, value: d.device_id }))
)

const columns = [
  { name: 'id', label: 'ID', field: 'id' },
  { name: 'device_id', label: 'Thiết bị', field: 'device_id' },
  { name: 'name', label: 'Tên', field: 'name' },
  { name: 'enabled', label: 'Bật/Tắt', field: 'enabled', align: 'center' },
  { name: 'actions', label: 'Thao tác', align: 'center' }
]

function editRule(rule) {
  editingRule.value = rule
  ruleForm.value = {
    device_id: rule.device_id,
    name: rule.name,
    condition: rule.condition_json,
    action: rule.action_json,
    enabled: rule.enabled
  }
  showCreateDialog.value = true
}

async function toggleRule(rule) {
  try {
    await rulesAPI.toggle(rule.id)
    await appStore.fetchRules()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Lỗi: ' + error.message })
  }
}

async function saveRule() {
  try {
    if (editingRule.value) {
      await rulesAPI.update(editingRule.value.id, ruleForm.value)
      $q.notify({ type: 'positive', message: 'Đã cập nhật rule' })
    } else {
      await rulesAPI.create(ruleForm.value)
      $q.notify({ type: 'positive', message: 'Đã tạo rule mới' })
    }
    showCreateDialog.value = false
    await appStore.fetchRules()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Lỗi: ' + error.message })
  }
}

async function deleteRule(id) {
  $q.dialog({
    title: 'Xác nhận',
    message: 'Bạn có chắc muốn xóa rule này?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await rulesAPI.delete(id)
      $q.notify({ type: 'positive', message: 'Đã xóa rule' })
      await appStore.fetchRules()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Lỗi: ' + error.message })
    }
  })
}

onMounted(() => {
  appStore.fetchRules()
  appStore.fetchDevices()
})
</script>

