<template>
  <q-page class="schedules-page">
    <div class="page-container q-pa-lg">
      <div class="page-header q-mb-xl">
        <div>
          <div class="text-h3 text-weight-bold text-grey-9 q-mb-xs">
            <q-icon name="schedule" size="36px" class="q-mr-sm" color="primary" />
            Quản lý lịch trình
          </div>
          <div class="text-body1 text-grey-6">Tạo và quản lý lịch trình cho cây trồng</div>
        </div>
        <q-space />
        <q-btn
          color="primary"
          icon="add"
          label="Tạo lịch trình"
          unelevated
          rounded
          @click="showCreateDialog = true"
          class="refresh-btn"
          size="md"
        />
      </div>

      <q-card class="modern-card" flat>
        <q-table
          :rows="schedules"
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
                  icon="edit"
                  color="primary"
                  size="sm"
                  @click="editSchedule(props.row)"
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
                  @click="deleteSchedule(props.row.id)"
                >
                  <q-tooltip>Xóa</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center text-grey-6 q-gutter-sm q-pa-lg">
              <q-icon name="schedule" size="2em" />
              <span>Chưa có lịch trình nào</span>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 550px" class="schedule-dialog">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6 text-weight-bold">
            {{ editingSchedule ? 'Chỉnh sửa' : 'Tạo mới' }} lịch trình
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="q-gutter-md">
            <q-input
              v-model="scheduleForm.crop_name"
              label="Tên cây trồng"
              outlined
              dense
              :rules="[val => !!val || 'Vui lòng nhập tên cây trồng']"
            >
              <template v-slot:prepend>
                <q-icon name="eco" />
              </template>
            </q-input>

            <q-input
              v-model="scheduleForm.start_date"
              label="Ngày bắt đầu"
              outlined
              dense
              mask="####-##-##"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
              <template v-slot:append>
                <q-icon name="calendar_today" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="scheduleForm.start_date" mask="YYYY-MM-DD">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Đóng" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <div class="text-caption text-grey-6 q-mt-sm">
              <q-icon name="info" size="16px" class="q-mr-xs" />
              Lịch trình chi tiết sẽ được cấu hình sau khi tạo
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Hủy" color="grey-7" v-close-popup />
          <q-btn unelevated label="Lưu" color="primary" icon="save" @click="saveSchedule" />
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
  schedule_json: [],
})

const columns = [
  { name: 'id', label: 'ID', field: 'id' },
  { name: 'crop_name', label: 'Tên cây trồng', field: 'crop_name' },
  { name: 'start_date', label: 'Ngày bắt đầu', field: 'start_date' },
  { name: 'device_count', label: 'Số thiết bị', field: 'device_count' },
  { name: 'actions', label: 'Thao tác', align: 'center' },
]

function editSchedule(schedule) {
  editingSchedule.value = schedule
  scheduleForm.value = {
    crop_name: schedule.crop_name,
    start_date: schedule.start_date,
    schedule_json: schedule.schedule_json,
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
    persistent: true,
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

<style scoped>
.schedules-page {
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

.schedule-dialog {
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
