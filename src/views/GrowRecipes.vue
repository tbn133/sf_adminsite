<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h4">Grow Recipes</div>
        <q-btn color="primary" label="Create New Recipe" icon="add" @click="openCreateDialog" />
      </div>

      <!-- Filters -->
      <div class="row q-gutter-md q-mb-md">
        <q-select
          v-model="filterCropType"
          :options="cropTypeOptions"
          label="Filter by Crop Type"
          clearable
          style="min-width: 200px"
          @update:model-value="loadRecipes"
        />
        <q-toggle
          v-model="filterPublicOnly"
          label="Public Recipes Only"
          @update:model-value="loadRecipes"
        />
      </div>

      <!-- Recipes Table -->
      <q-table :rows="recipes" :columns="columns" row-key="id" :loading="loading" flat bordered>
        <template v-slot:body-cell-stages="props">
          <q-td :props="props"> {{ props.row.stages.length }} stages </q-td>
        </template>

        <template v-slot:body-cell-duration="props">
          <q-td :props="props"> {{ props.row.total_duration_days }} days </q-td>
        </template>

        <template v-slot:body-cell-is_public="props">
          <q-td :props="props">
            <q-chip :color="props.row.is_public ? 'green' : 'grey'" text-color="white" size="sm">
              {{ props.row.is_public ? 'Public' : 'Private' }}
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
              @click="viewRecipe(props.row)"
            >
              <q-tooltip>View Details</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="edit" color="blue" @click="editRecipe(props.row)">
              <q-tooltip>Edit</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="play_arrow"
              color="green"
              @click="showStartDialog(props.row)"
            >
              <q-tooltip>Start Recipe</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="delete" color="red" @click="deleteRecipe(props.row)">
              <q-tooltip>Delete</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 800px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">{{ isEdit ? 'Edit Recipe' : 'Create New Recipe' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveRecipe">
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  v-model="recipeForm.name"
                  label="Recipe Name *"
                  :rules="[val => !!val || 'Required']"
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="recipeForm.crop_type"
                  :options="cropTypeOptions"
                  label="Crop Type *"
                  :rules="[val => !!val || 'Required']"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="recipeForm.description"
                  label="Description"
                  type="textarea"
                  rows="3"
                />
              </div>
              <div class="col-6">
                <q-input v-model="recipeForm.created_by" label="Created By" />
              </div>
              <div class="col-6">
                <q-toggle v-model="recipeForm.is_public" label="Make Public" />
              </div>
            </div>

            <!-- Stages -->
            <div class="q-mt-md">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-h6">Growth Stages</div>
                <q-btn color="primary" label="Add Stage" icon="add" size="sm" @click="addStage" />
              </div>

              <q-list bordered separator>
                <q-item v-for="(stage, index) in recipeForm.stages" :key="index">
                  <q-item-section>
                    <q-expansion-item
                      :label="`Stage ${stage.stage_number}: ${stage.name || 'Unnamed'}`"
                      :caption="`Duration: ${stage.duration_days || 0} days`"
                    >
                      <q-card>
                        <q-card-section>
                          <div class="row q-col-gutter-sm">
                            <div class="col-4">
                              <q-input v-model="stage.name" label="Stage Name *" dense />
                            </div>
                            <div class="col-4">
                              <q-input
                                v-model.number="stage.duration_days"
                                label="Duration (days) *"
                                type="number"
                                dense
                              />
                            </div>
                            <div class="col-4">
                              <q-input
                                v-model.number="stage.light_intensity_percent"
                                label="Light Intensity %"
                                type="number"
                                dense
                              />
                            </div>

                            <!-- Temperature -->
                            <div class="col-6">
                              <q-input
                                v-model.number="stage.target_temperature_min"
                                label="Min Temperature (°C)"
                                type="number"
                                step="0.1"
                                dense
                              />
                            </div>
                            <div class="col-6">
                              <q-input
                                v-model.number="stage.target_temperature_max"
                                label="Max Temperature (°C)"
                                type="number"
                                step="0.1"
                                dense
                              />
                            </div>

                            <!-- Humidity -->
                            <div class="col-6">
                              <q-input
                                v-model.number="stage.target_humidity_min"
                                label="Min Humidity (%)"
                                type="number"
                                step="0.1"
                                dense
                              />
                            </div>
                            <div class="col-6">
                              <q-input
                                v-model.number="stage.target_humidity_max"
                                label="Max Humidity (%)"
                                type="number"
                                step="0.1"
                                dense
                              />
                            </div>

                            <!-- VPD -->
                            <div class="col-6">
                              <q-input
                                v-model.number="stage.target_vpd_min"
                                label="Min VPD (kPa)"
                                type="number"
                                step="0.1"
                                dense
                              />
                            </div>
                            <div class="col-6">
                              <q-input
                                v-model.number="stage.target_vpd_max"
                                label="Max VPD (kPa)"
                                type="number"
                                step="0.1"
                                dense
                              />
                            </div>

                            <!-- Lighting Schedule -->
                            <div class="col-6">
                              <q-input
                                v-model="stage.light_on_time"
                                label="Light ON Time (HH:MM)"
                                placeholder="08:00"
                                dense
                              />
                            </div>
                            <div class="col-6">
                              <q-input
                                v-model="stage.light_off_time"
                                label="Light OFF Time (HH:MM)"
                                placeholder="20:00"
                                dense
                              />
                            </div>

                            <!-- Notes -->
                            <div class="col-12">
                              <q-input
                                v-model="stage.notes"
                                label="Stage Notes"
                                type="textarea"
                                rows="2"
                                dense
                              />
                            </div>

                            <!-- Remove button -->
                            <div class="col-12 text-right">
                              <q-btn
                                flat
                                color="red"
                                label="Remove Stage"
                                icon="delete"
                                size="sm"
                                @click="removeStage(index)"
                              />
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </q-expansion-item>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" @click="showDialog = false" />
          <q-btn label="Save Recipe" color="primary" @click="saveRecipe" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Start Recipe Dialog -->
    <q-dialog v-model="showStartRecipeDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Start Recipe: {{ selectedRecipe?.name }}</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="startRecipeForm.device_id"
            :options="deviceOptions"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            label="Select Device *"
          />
          <q-input
            v-model="startRecipeForm.notes"
            label="Notes"
            type="textarea"
            rows="3"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" @click="showStartRecipeDialog = false" />
          <q-btn label="Let's Get Growing!" color="green" icon="play_arrow" @click="startRecipe" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default {
  name: 'GrowRecipes',
  setup() {
    const $q = useQuasar()
    const loading = ref(false)
    const recipes = ref([])
    const showDialog = ref(false)
    const showStartRecipeDialog = ref(false)
    const isEdit = ref(false)
    const selectedRecipe = ref(null)
    const deviceOptions = ref([])
    const filterCropType = ref(null)
    const filterPublicOnly = ref(false)

    const cropTypeOptions = [
      'Tomato',
      'Lettuce',
      'Basil',
      'Strawberry',
      'Cannabis',
      'Microgreens',
      'Other',
    ]

    const recipeForm = ref({
      name: '',
      crop_type: '',
      description: '',
      is_public: false,
      created_by: '',
      stages: [],
    })

    const startRecipeForm = ref({
      device_id: null,
      notes: '',
    })

    const columns = [
      { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
      { name: 'name', label: 'Recipe Name', field: 'name', align: 'left', sortable: true },
      { name: 'crop_type', label: 'Crop Type', field: 'crop_type', align: 'left', sortable: true },
      { name: 'stages', label: 'Stages', field: 'stages', align: 'center' },
      {
        name: 'duration',
        label: 'Total Duration',
        field: 'total_duration_days',
        align: 'center',
        sortable: true,
      },
      { name: 'is_public', label: 'Visibility', field: 'is_public', align: 'center' },
      { name: 'actions', label: 'Actions', align: 'center' },
    ]

    const loadRecipes = async () => {
      loading.value = true
      try {
        const params = {}
        if (filterCropType.value) params.crop_type = filterCropType.value
        if (filterPublicOnly.value) params.is_public = true

        const response = await axios.get(`${API_BASE}/api/recipes`, { params })
        recipes.value = response.data
      } catch (error) {
        $q.notify({ type: 'negative', message: 'Failed to load recipes' })
      } finally {
        loading.value = false
      }
    }

    const loadDevices = async () => {
      try {
        const response = await axios.get(`${API_BASE}/admin/devices`)
        deviceOptions.value = response.data.filter(d => d.online)
      } catch (error) {
        console.error('Failed to load devices:', error)
      }
    }

    const openCreateDialog = () => {
      isEdit.value = false
      recipeForm.value = {
        name: '',
        crop_type: '',
        description: '',
        is_public: false,
        created_by: '',
        stages: [],
      }
      showDialog.value = true
    }

    const viewRecipe = recipe => {
      $q.notify({ message: 'View functionality - Navigate to detail page', color: 'info' })
    }

    const editRecipe = recipe => {
      isEdit.value = true
      selectedRecipe.value = recipe
      recipeForm.value = {
        name: recipe.name,
        crop_type: recipe.crop_type,
        description: recipe.description,
        is_public: recipe.is_public,
        created_by: recipe.created_by,
        stages: JSON.parse(JSON.stringify(recipe.stages)), // Deep clone
      }
      showDialog.value = true
    }

    const addStage = () => {
      const newStageNumber = recipeForm.value.stages.length + 1
      recipeForm.value.stages.push({
        stage_number: newStageNumber,
        name: '',
        duration_days: 7,
        target_temperature_min: null,
        target_temperature_max: null,
        target_humidity_min: null,
        target_humidity_max: null,
        target_vpd_min: null,
        target_vpd_max: null,
        light_on_time: null,
        light_off_time: null,
        light_intensity_percent: null,
        watering_schedule: null,
        fan_schedule: null,
        notes: '',
      })
    }

    const removeStage = index => {
      recipeForm.value.stages.splice(index, 1)
      // Renumber stages
      recipeForm.value.stages.forEach((stage, idx) => {
        stage.stage_number = idx + 1
      })
    }

    const saveRecipe = async () => {
      if (
        !recipeForm.value.name ||
        !recipeForm.value.crop_type ||
        recipeForm.value.stages.length === 0
      ) {
        $q.notify({
          type: 'warning',
          message: 'Please fill required fields and add at least one stage',
        })
        return
      }

      loading.value = true
      try {
        if (isEdit.value) {
          await axios.put(`${API_BASE}/api/recipes/${selectedRecipe.value.id}`, recipeForm.value)
          $q.notify({ type: 'positive', message: 'Recipe updated successfully' })
        } else {
          await axios.post(`${API_BASE}/api/recipes`, recipeForm.value)
          $q.notify({ type: 'positive', message: 'Recipe created successfully' })
        }
        showDialog.value = false
        await loadRecipes()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.response?.data?.detail || 'Failed to save recipe',
        })
      } finally {
        loading.value = false
      }
    }

    const deleteRecipe = recipe => {
      $q.dialog({
        title: 'Confirm',
        message: `Are you sure you want to delete recipe "${recipe.name}"?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await axios.delete(`${API_BASE}/api/recipes/${recipe.id}`)
          $q.notify({ type: 'positive', message: 'Recipe deleted successfully' })
          await loadRecipes()
        } catch (error) {
          $q.notify({
            type: 'negative',
            message: error.response?.data?.detail || 'Failed to delete recipe',
          })
        }
      })
    }

    const showStartDialog = recipe => {
      selectedRecipe.value = recipe
      startRecipeForm.value = {
        device_id: null,
        notes: '',
      }
      showStartRecipeDialog.value = true
    }

    const startRecipe = async () => {
      if (!startRecipeForm.value.device_id) {
        $q.notify({ type: 'warning', message: 'Please select a device' })
        return
      }

      try {
        await axios.post(
          `${API_BASE}/api/recipes/${selectedRecipe.value.id}/start`,
          startRecipeForm.value
        )
        $q.notify({ type: 'positive', message: "Recipe started! Let's get growing! 🌱" })
        showStartRecipeDialog.value = false
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.response?.data?.detail || 'Failed to start recipe',
        })
      }
    }

    onMounted(() => {
      loadRecipes()
      loadDevices()
    })

    return {
      loading,
      recipes,
      columns,
      showDialog,
      showStartRecipeDialog,
      isEdit,
      selectedRecipe,
      recipeForm,
      startRecipeForm,
      deviceOptions,
      cropTypeOptions,
      filterCropType,
      filterPublicOnly,
      loadRecipes,
      openCreateDialog,
      viewRecipe,
      editRecipe,
      addStage,
      removeStage,
      saveRecipe,
      deleteRecipe,
      showStartDialog,
      startRecipe,
    }
  },
}
</script>

<style scoped>
.q-expansion-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
}
</style>
