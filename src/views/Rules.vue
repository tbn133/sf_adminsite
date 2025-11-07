<template>
  <q-page class="rules-page">
    <div class="page-container q-pa-lg">
      <div class="page-header q-mb-xl">
        <div>
          <div class="text-h3 text-weight-bold text-grey-9 q-mb-xs">
            <q-icon name="rule" size="36px" class="q-mr-sm" color="primary" />
            Quản lý Rules
          </div>
          <div class="text-body1 text-grey-6">Tạo và quản lý quy tắc tự động</div>
        </div>
        <q-space />
        <q-btn
          color="primary"
          icon="add"
          label="Tạo rule"
          unelevated
          rounded
          @click="showCreateDialog = true"
          class="refresh-btn"
          size="md"
        />
      </div>

      <q-card class="modern-card" flat>
      <q-table
        :rows="rules"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :rows-per-page-options="[10, 20, 50]"
      >
        <template v-slot:body-cell-enabled="props">
          <q-td :props="props">
            <q-toggle
              :model-value="props.row.enabled"
              @update:model-value="toggleRule(props.row)"
              color="positive"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="row q-gutter-xs">
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="primary"
                size="sm"
                @click="editRule(props.row)"
              >
                <q-tooltip>Chỉnh sửa</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                size="sm"
                @click="deleteRule(props.row.id)"
              >
                <q-tooltip>Xóa</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center text-grey-6 q-gutter-sm q-pa-lg">
            <q-icon name="rule" size="2em" />
            <span>Chưa có rule nào</span>
          </div>
        </template>
      </q-table>
      </q-card>
    </div>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 600px" class="rule-dialog">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6 text-weight-bold">
            {{ editingRule ? 'Chỉnh sửa' : 'Tạo mới' }} rule
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="q-gutter-md">
            <q-select
              v-model="ruleForm.device_id"
              :options="deviceOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Thiết bị"
              outlined
              dense
              :rules="[val => !!val || 'Vui lòng chọn thiết bị']"
            >
              <template v-slot:prepend>
                <q-icon name="devices" />
              </template>
            </q-select>

            <q-input
              v-model="ruleForm.name"
              label="Tên rule"
              outlined
              dense
              :rules="[val => !!val || 'Vui lòng nhập tên rule']"
            >
              <template v-slot:prepend>
                <q-icon name="label" />
              </template>
            </q-input>

            <q-card flat bordered class="bg-grey-1">
              <q-card-section>
                <div class="text-caption text-grey-6">
                  <q-icon name="info" size="16px" class="q-mr-xs" />
                  Condition và Action sẽ được cấu hình chi tiết sau
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Hủy" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Lưu"
            color="primary"
            icon="save"
            @click="saveRule"
          />
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

<style scoped>
.rules-page {
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

.rule-dialog {
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

