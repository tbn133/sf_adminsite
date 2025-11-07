<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h4">Quản lý lịch trình</div>
      <q-space />
      <q-btn color="primary" icon="add" label="Tạo lịch trình" @click="showCreateDialog = true" />
    </div>

    <q-table
      :rows="schedules"
      :columns="columns"
      row-key="id"
      :loading="loading"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round dense icon="edit" color="primary" @click="editSchedule(props.row)" />
          <q-btn flat round dense icon="delete" color="negative" @click="deleteSchedule(props.row.id)" />
        </q-td>
      </template>
    </q-table>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showCreateDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ editingSchedule ? 'Chỉnh sửa' : 'Tạo mới' }} lịch trình</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="scheduleForm.crop_name" label="Tên cây trồng" outlined />
          <q-date v-model="scheduleForm.start_date" label="Ngày bắt đầu" class="q-mt-md" />
          <div class="text-caption q-mt-sm">Lịch trình (sẽ cần form phức tạp hơn để thêm schedule entries)</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Hủy" v-close-popup />
          <q-btn flat label="Lưu" color="primary" @click="saveSchedule" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { schedulesAPI } from '../services/api'
import { useQuasar } from 'quasar'

const appStore = useAppStore()
const $q = useQuasar()

const { schedules, loading } = appStore
const showCreateDialog = ref(false)
const editingSchedule = ref(null)
const scheduleForm = ref({
  crop_name: '',
  start_date: new Date().toISOString().split('T')[0],
  schedule_json: []
})

const columns = [
  { name: 'id', label: 'ID', field: 'id' },
  { name: 'crop_name', label: 'Tên cây trồng', field: 'crop_name' },
  { name: 'start_date', label: 'Ngày bắt đầu', field: 'start_date' },
  { name: 'device_count', label: 'Số thiết bị', field: 'device_count' },
  { name: 'actions', label: 'Thao tác', align: 'center' }
]

function editSchedule(schedule) {
  editingSchedule.value = schedule
  scheduleForm.value = {
    crop_name: schedule.crop_name,
    start_date: schedule.start_date,
    schedule_json: schedule.schedule_json
  }
  showCreateDialog.value = true
}

async function saveSchedule() {
  try {
    if (editingSchedule.value) {
      await schedulesAPI.update(editingSchedule.value.id, scheduleForm.value)
      $q.notify({ type: 'positive', message: 'Đã cập nhật lịch trình' })
    } else {
      await schedulesAPI.create(scheduleForm.value)
      $q.notify({ type: 'positive', message: 'Đã tạo lịch trình mới' })
    }
    showCreateDialog.value = false
    await appStore.fetchSchedules()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Lỗi: ' + error.message })
  }
}

async function deleteSchedule(id) {
  $q.dialog({
    title: 'Xác nhận',
    message: 'Bạn có chắc muốn xóa lịch trình này?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await schedulesAPI.delete(id)
      $q.notify({ type: 'positive', message: 'Đã xóa lịch trình' })
      await appStore.fetchSchedules()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Lỗi: ' + error.message })
    }
  })
}

onMounted(() => {
  appStore.fetchSchedules()
})
</script>

