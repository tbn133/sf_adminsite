<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h4">Recipe Executions</div>
        <q-btn-group>
          <q-btn
            :color="statusFilter === 'running' ? 'primary' : 'grey'"
            label="Running"
            @click="setFilter('running')"
          />
          <q-btn
            :color="statusFilter === 'completed' ? 'primary' : 'grey'"
            label="Completed"
            @click="setFilter('completed')"
          />
          <q-btn
            :color="statusFilter === 'stopped' ? 'primary' : 'grey'"
            label="Stopped"
            @click="setFilter('stopped')"
          />
          <q-btn
            :color="statusFilter === null ? 'primary' : 'grey'"
            label="All"
            @click="setFilter(null)"
          />
        </q-btn-group>
      </div>

      <!-- Executions Grid -->
      <div class="row q-col-gutter-md">
        <div v-for="execution in executions" :key="execution.id" class="col-12 col-md-6 col-lg-4">
          <q-card class="execution-card">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">{{ execution.recipe?.name || 'Unknown Recipe' }}</div>
              <div class="text-caption">{{ execution.recipe?.crop_type }}</div>
            </q-card-section>

            <q-card-section>
              <!-- Status -->
              <div class="row items-center q-mb-sm">
                <q-chip
                  :color="getStatusColor(execution.status)"
                  text-color="white"
                  icon="info"
                  size="sm"
                >
                  {{ execution.status.toUpperCase() }}
                </q-chip>
                <q-space />
                <span class="text-caption text-grey">Device ID: {{ execution.device_id }}</span>
              </div>

              <!-- Progress -->
              <div
                v-if="execution.status === 'running' && executionProgress[execution.id]"
                class="q-mt-md"
              >
                <div class="text-subtitle2">Current Stage</div>
                <div class="row items-center q-mb-xs">
                  <div class="col">
                    <strong>{{ executionProgress[execution.id].current_stage.name }}</strong>
                    (Stage {{ executionProgress[execution.id].current_stage.number }})
                  </div>
                </div>
                <q-linear-progress
                  :value="executionProgress[execution.id].current_stage.progress_percent / 100"
                  color="primary"
                  size="20px"
                  class="q-mb-xs"
                >
                  <div class="absolute-full flex flex-center">
                    <q-badge
                      color="white"
                      text-color="primary"
                      :label="`${executionProgress[execution.id].current_stage.progress_percent.toFixed(0)}%`"
                    />
                  </div>
                </q-linear-progress>
                <div class="text-caption text-grey">
                  {{ executionProgress[execution.id].current_stage.days_remaining }} days remaining
                </div>

                <q-separator class="q-my-md" />

                <div class="text-subtitle2">Overall Progress</div>
                <q-linear-progress
                  :value="executionProgress[execution.id].overall_progress.progress_percent / 100"
                  color="green"
                  size="20px"
                  class="q-mb-xs"
                >
                  <div class="absolute-full flex flex-center">
                    <q-badge
                      color="white"
                      text-color="green"
                      :label="`${executionProgress[execution.id].overall_progress.progress_percent.toFixed(0)}%`"
                    />
                  </div>
                </q-linear-progress>
                <div class="text-caption text-grey">
                  Day {{ executionProgress[execution.id].overall_progress.days_elapsed }} of
                  {{ executionProgress[execution.id].overall_progress.days_total }} ({{
                    executionProgress[execution.id].overall_progress.days_remaining
                  }}
                  days remaining)
                </div>
              </div>

              <!-- Timestamps -->
              <div class="q-mt-md">
                <div class="text-caption text-grey">
                  <strong>Started:</strong> {{ formatDate(execution.started_at) }}
                </div>
                <div v-if="execution.completed_at" class="text-caption text-grey">
                  <strong>Completed:</strong> {{ formatDate(execution.completed_at) }}
                </div>
                <div v-if="execution.stopped_at" class="text-caption text-grey">
                  <strong>Stopped:</strong> {{ formatDate(execution.stopped_at) }}
                </div>
              </div>

              <!-- Notes -->
              <div v-if="execution.notes" class="q-mt-sm">
                <q-badge color="grey-4" text-color="grey-8" :label="execution.notes" />
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right">
              <q-btn
                v-if="execution.status === 'running'"
                flat
                color="orange"
                icon="pause"
                label="Pause"
                @click="pauseExecution(execution.id)"
              />
              <q-btn
                v-if="execution.status === 'paused'"
                flat
                color="green"
                icon="play_arrow"
                label="Resume"
                @click="resumeExecution(execution.id)"
              />
              <q-btn
                v-if="execution.status === 'running' || execution.status === 'paused'"
                flat
                color="red"
                icon="stop"
                label="Stop"
                @click="stopExecution(execution.id)"
              />
              <q-btn flat color="primary" icon="refresh" @click="refreshProgress(execution.id)">
                <q-tooltip>Refresh Progress</q-tooltip>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && executions.length === 0" class="text-center q-pa-xl">
        <q-icon name="eco" size="80px" color="grey-5" />
        <div class="text-h6 text-grey-7 q-mt-md">No recipe executions found</div>
        <div class="text-caption text-grey-6">Start a recipe from the Grow Recipes page</div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default {
  name: 'RecipeExecutions',
  setup() {
    const $q = useQuasar()
    const loading = ref(false)
    const executions = ref([])
    const executionProgress = ref({})
    const statusFilter = ref('running')
    let refreshInterval = null

    const loadExecutions = async () => {
      loading.value = true
      try {
        const params = {}
        if (statusFilter.value) params.status = statusFilter.value

        const response = await axios.get(`${API_BASE}/api/recipes/executions`, { params })
        executions.value = response.data

        // Load progress for running executions
        for (const execution of executions.value) {
          if (execution.status === 'running') {
            await loadProgress(execution.id)
          }
        }
      } catch (error) {
        $q.notify({ type: 'negative', message: 'Failed to load executions' })
      } finally {
        loading.value = false
      }
    }

    const loadProgress = async executionId => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/recipes/executions/${executionId}/progress`
        )
        executionProgress.value[executionId] = response.data
      } catch (error) {
        console.error(`Failed to load progress for execution ${executionId}:`, error)
      }
    }

    const refreshProgress = async executionId => {
      await loadProgress(executionId)
      $q.notify({ type: 'positive', message: 'Progress updated', timeout: 1000 })
    }

    const stopExecution = executionId => {
      $q.dialog({
        title: 'Confirm Stop',
        message: 'Are you sure you want to stop this recipe? This action cannot be undone.',
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await axios.post(`${API_BASE}/api/recipes/executions/${executionId}/stop`)
          $q.notify({ type: 'positive', message: 'Recipe stopped successfully' })
          await loadExecutions()
        } catch (error) {
          $q.notify({
            type: 'negative',
            message: error.response?.data?.detail || 'Failed to stop recipe',
          })
        }
      })
    }

    const pauseExecution = async executionId => {
      try {
        await axios.post(`${API_BASE}/api/recipes/executions/${executionId}/pause`)
        $q.notify({ type: 'positive', message: 'Recipe paused' })
        await loadExecutions()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.response?.data?.detail || 'Failed to pause recipe',
        })
      }
    }

    const resumeExecution = async executionId => {
      try {
        await axios.post(`${API_BASE}/api/recipes/executions/${executionId}/resume`)
        $q.notify({ type: 'positive', message: 'Recipe resumed' })
        await loadExecutions()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.response?.data?.detail || 'Failed to resume recipe',
        })
      }
    }

    const getStatusColor = status => {
      const colors = {
        running: 'green',
        paused: 'orange',
        completed: 'blue',
        stopped: 'red',
      }
      return colors[status] || 'grey'
    }

    const formatDate = dateString => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleString()
    }

    const setFilter = filter => {
      statusFilter.value = filter
      loadExecutions()
    }

    onMounted(() => {
      loadExecutions()
      // Auto-refresh every 30 seconds
      refreshInterval = setInterval(() => {
        loadExecutions()
      }, 30000)
    })

    onUnmounted(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    })

    return {
      loading,
      executions,
      executionProgress,
      statusFilter,
      loadExecutions,
      refreshProgress,
      stopExecution,
      pauseExecution,
      resumeExecution,
      getStatusColor,
      formatDate,
      setFilter,
    }
  },
}
</script>

<style scoped>
.execution-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
